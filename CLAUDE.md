# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"El Tchinko": a multiplayer wave-survival game. Server-authoritative Node.js game loop, three.js browser client, talking over WebSockets. Plain JS (ES modules, no TypeScript). No tests or linter are configured.

## Commands

- `npm run server`: start the Node server (HTTP + WebSocket on port 1234). It serves the **built** client from `dist/`.
- `npm run client`: Vite dev server for the client (hot reload). The client connects to `ws://<hostname>:1234`, so the game server must also be running.
- `npm run build`: build the client into `dist/` (committed to git). Rebuild before expecting `localhost:1234` to reflect client changes.

## Architecture

Three code areas under `src/`: `server/`, `client/`, `shared/`. Both sides use a Receiver/Sender/Service layout: Receiver parses incoming messages, Service applies them, Sender emits outgoing ones.

**Server (`src/server`)**
- `server.js` wires everything. `outgoing/Sender.js` owns the game loop: a `setInterval` calls `gametick/tick.js` and then broadcasts a full state snapshot as JSON to all clients, every tick.
- `shared/combatConfig.js` holds `TICK_MS` and all combat timing/damage numbers. Timings are measured in **ticks**, not ms. Note that `Sender.js` has its own `TICK_RATE = 20` constant that duplicates `TICK_MS`.
- `common/GameData.js` is the world state (players map, enemies array, wave, id counters).
- Entities: `Entity` (x, z) → `Alive` (health, moveSpeed, `combatState`) → `Player` / `Enemy`. Combat goes through `Alive`: `canAttack(target)` (overridden per class by `instanceof`, so no PvP), `takeDamage(amount)` (moves the target to `dead`), and `gameData.findAlive(id)`. `tick.js` removes dead enemies after all entities tick.

**State machine (the core pattern)**
- Every `Alive` has `combatState = { state: "<name>", states: { name: StateInstance }, transitions: { name: { event: nextName } } }`. `currentState` returns the active instance. Each state is constructed with its owning actor (`new IdleState(this)`), so ticks and requests don't pass the actor.
- States live in `server/gametick/states/` and extend `BaseState(actor, name)`: `initialize(context)`, `tick(gameData)`, `passiveTick()`. State names are the `StateName` enum (`states/name/StateName.js`), never raw strings.
- **Transitions are a per-entity map, never hardcoded in a state.** A state reports what happened via `actor.transition(StateEvent.X, context)` (`states/name/StateEvent.js`); the actor looks up `combatState.transitions[currentState][event]` (`gametick/transitions/PlayerTransitions.js`, `EnemyTransitions.js`), calls `nextState.initialize(context)` (one named context object like `{ targetId }` or `{ moveTarget }`, destructured by each state) and switches. An event with no entry in the current state's row is ignored. Client requests (`Service`) are just events too (`MOVE_REQUESTED`, `ATTACK_REQUESTED`), so states have no request handlers. To change behavior, edit the map; to give an entity new behavior, give it a different map. Dying is the one global exception: `takeDamage` calls `changeState(StateName.DEAD)` directly.
- Entity policy lives on `Alive` hooks: `canAttack(target)` (overridden by `instanceof`, so no PvP), `findTarget(gameData)` (idle uses it; enemies pick the nearest, players none), `takeDamage(amount)`; plus `gameData.findAlive(id)`. `tick.js` removes dead enemies after all entities tick.
- `passiveTick()` runs on **every** state every tick, even inactive ones, and only touches state-local data (e.g. cooldown/recovery timers), never `gameData` or other actors. `tick(gameData)` runs only on the current state. See the comment in `BaseState.js`.
- An attack is three ordinary top-level states chained by the maps: `WindupState` → `AttackState` (`StateName.HIT`, deals the damage on its first tick) → `RecoveryState`. Their names are what the client receives as the entity's visual state. `RecoveryState.recoveryTimer` is the attack cooldown: `AttackState` starts it when the hit begins (`startCooldown`, covering hit + recovery), `passiveTick` counts it down even while the actor is in another state, and `actor.isAttackOnCooldown` exposes it. Targeting and chase always just emit `TARGET_REACHED`; if the cooldown is still running when `WindupState` ticks, it emits `NOT_RECOVERED`, which the maps route to `RECOVERY` to wait it out.
- Abilities: the client sends `{ type: "ability", key: "q" }`; `Service.useAbility` maps the key to an `AbilityName` and `Player.useAbility` sets `combatState.abilities[name].armed` (ignored while that ability's own cooldown runs) and emits `ABILITY_REQUESTED`, which the player map routes from `HIT`/`RECOVERY` straight into `JUMP_WINDUP` so the jump doesn't wait for the regular attack to finish. Otherwise `WindupState` (checking this before the attack cooldown, abilities don't wait for it) sees `actor.hasArmedAbility` and emits `ABILITY_ARMED`, which the player map routes into the jump chain (`states/jumpAttack/`, three standalone classes, deliberately no shared base): `JUMP_WINDUP` (cancellable by a move, ability stays armed) → `JUMP_AIR` (the leap, straight up and down with no x/z movement for now; no `MOVE_REQUESTED` row, so it can't be cancelled; deals `damageMultiplier` damage on its last tick) → `JUMP_RECOVERY` (waits for the shared attack cooldown, cancellable) → `TARGETING`. The ability is spent (disarmed + `JumpAirState.cooldownTimer` started, counted in `passiveTick`, separate from the attack cooldown on `RecoveryState`) only if the landing actually damaged someone. Cancel rules live only in the maps. `Sender` sends `abilities` per player (armed + cooldown ticks) for the HUD slot and the armed tint. Numbers in `PLAYER_JUMP` are placeholders.
- Convention: all transient state-machine fields (targets, timers, `isMoving`, etc.) live in `entity.combatState`, **never** as flat properties on `Player`/`Enemy`. Entity classes hold only identity and physics. Apply this to any new entity type too.
- Timers are currently in flux. The most recent commit says they are not settled, so expect refactors in this area.

**Client (`src/client`)**
- `client.js` sets up three.js, then runs the render loop: flush the outbox, update the camera, run input, tick views, render.
- Incoming: `incoming/Receiver.js` → `GameStateService` applies `welcome`/`state` messages by syncing server entities to view objects (`common/view/types/*View.js`), creating and removing them by id. The client keeps no game logic and just renders what the server says.
- Outgoing: input (`outgoing/input/`) → `Service` queues commands in an outbox → `Sender.flush` sends them over the WebSocket.
- Client-side `common/view/states/` holds visual states (Windup/Hit/Recovery, plus JumpWindup/JumpAir) named after the server's states of the same name. Regular attacks swing around the y axis (`userData.swingYaw` added to the facing yaw: turn right, swing left, recover to center), only the Q jump pitches (`rotation.x`, euler order `YXZ`, so the pitch is relative to the facing). The server keeps `Entity.facing` (yaw, set via `Alive.faceTowards(point)` by moving/targeting/chase/attack states and sent in every snapshot) and the views turn toward it (`common/view/facing.js`).
