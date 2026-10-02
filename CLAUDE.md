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
- Every `Alive` has `combatState = { state: "<name>", states: { name: StateInstance } }`. `currentState` returns the active instance. Each state is constructed with its owning actor (`new IdleState(this)`), so ticks and requests don't pass the actor.
- States live in `server/gametick/states/` and extend `BaseState(actor, name)`: `tick(gameData)`, `passiveTick()`, `processMoveRequest`, `processAttackRequest`. State names are the `StateName` enum (`gametick/states/StateName.js`), never raw strings. To switch state: `actor.getState(StateName.X).initialize(<its explicit params>)`, then `actor.changeState(StateName.X)`; never assign `combatState.state` directly. When an attack finishes, recovery calls `actor.onAttackFinished(targetId)`, an `Alive` hook each entity overrides (player returns to targeting, enemy to chaseAround, default idle). Out-of-range is handled by those states re-approaching the target, so entities need no separate out-of-range transition.
- `passiveTick()` runs on **every** state every tick, even inactive ones, and only touches state-local data (e.g. cooldown/recovery timers), never `gameData` or other actors. `tick(gameData)` runs only on the current state. See the comment in `BaseState.js`.
- `BasicAttackState` is a composite: it delegates to `WindupState` → `AttackState` → `RecoveryState` sub-states. Each sub-state gets its parent in its constructor and has `tick(gameData)`; each sub-state moves to the next by calling its `initialize` and setting the parent's `_current` itself. The sub-state name is what gets sent to the client as the entity's visual state (`_visualState` in `Sender.js`).
- Convention: all transient state-machine fields (targets, timers, `isMoving`, etc.) live in `entity.combatState`, **never** as flat properties on `Player`/`Enemy`. Entity classes hold only identity and physics. Apply this to any new entity type too.
- Timers are currently in flux. The most recent commit says they are not settled, so expect refactors in this area.

**Client (`src/client`)**
- `client.js` sets up three.js, then runs the render loop: flush the outbox, update the camera, run input, tick views, render.
- Incoming: `incoming/Receiver.js` → `GameStateService` applies `welcome`/`state` messages by syncing server entities to view objects (`common/view/types/*View.js`), creating and removing them by id. The client keeps no game logic and just renders what the server says.
- Outgoing: input (`outgoing/input/`) → `Service` queues commands in an outbox → `Sender.flush` sends them over the WebSocket.
- Client-side `common/view/states/` holds visual states (Windup/Recovery) that mirror the server's sub-state names.
