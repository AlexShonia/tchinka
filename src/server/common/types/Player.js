import { PLAYER_MOVE_SPEED, PLAYER_MAX_HEALTH, PLAYER_MAX_MANA, PLAYER_PROGRESSION, PLAYER_COMBAT, PLAYER_JUMP } from "../../../shared/combatConfig.js";
import { Alive }             from "./Alive.js";
import { Enemy }             from "./Enemy.js";
import { BasicAttackState }  from "../../gametick/states/BasicAttackState.js";
import { JumpAttackState }   from "../../gametick/states/JumpAttackState.js";
import { MovingState }       from "../../gametick/states/MovingState.js";
import { TargetingState }    from "../../gametick/states/TargetingState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }         from "../../gametick/states/DeadState.js";
import { State }        from "../../gametick/transitions/types/State.js";
import { AbilityName }       from "../../gametick/states/name/AbilityName.js";
import { PlayerTransitions } from "../../gametick/transitions/PlayerTransitions.js";

export class Player extends Alive {
	constructor(id) {
		super();
		this.id                  = id;
		this.mana                = PLAYER_MAX_MANA;
		this.level               = 0;
		this.xp                  = 0;
		this.attackRange         = 3;
		this.health              = PLAYER_MAX_HEALTH;
		this.moveSpeed           = PLAYER_MOVE_SPEED;
		this.damage              = PLAYER_COMBAT.damage;

		this.combatState = {
			state: State.IDLE,
			states: {
				[State.IDLE]:         new IdleState(this),
				[State.MOVING]:       new MovingState(this),
				[State.TARGETING]:    new TargetingState(this),
				[State.BASIC_ATTACK]: new BasicAttackState(this, PLAYER_COMBAT.windupTicks, PLAYER_COMBAT.attackTicks, PLAYER_COMBAT.recoveryTicks),
				[State.JUMP_ATTACK]:  new JumpAttackState(this, PLAYER_JUMP.windupTicks, PLAYER_JUMP.airTicks, PLAYER_JUMP.damageMultiplier, PLAYER_JUMP.cooldownTicks),
				[State.DEAD]:         new DeadState(this),
			},
			transitions: PlayerTransitions,
			abilities: {
				[AbilityName.JUMPING_ATTACK]: { armed: false, state: State.JUMP_ATTACK, unlockLevel: PLAYER_JUMP.unlockLevel, manaCost: PLAYER_JUMP.manaCost } // JUMP_ATTACK owns the ability cooldown
			},
		};
	}

	canAttack(target) {
		return target instanceof Enemy;
	}

	get xpToNext() {
		return PLAYER_PROGRESSION.xpPerLevel * (this.level + 1);
	}

	gainXp(amount) {
		this.xp += amount;
		while (this.xp >= this.xpToNext) {
			this.xp -= this.xpToNext;
			this.level++;
		}
	}

	// pays the mana and arms the ability; the attack state notices it on its next tick (also while an attack is already running)
	// an already armed ability is ignored so pressing the key again doesn't cost twice
	useAbility(name) {
		const ability = this.combatState.abilities[name];
		if (!ability || this.isDead || ability.armed) return;
		if (this.level < ability.unlockLevel || this.mana < ability.manaCost) return;
		if (this.getState(ability.state).cooldownTimer > 0) return;
		this.mana -= ability.manaCost;
		ability.armed = true;
	}

	// what the client needs to draw the abilities: armed flag, unlocked, mana cost and cooldown (in ticks) per ability
	get abilitySnapshot() {
		const snapshot = {};
		for (const [name, ability] of Object.entries(this.combatState.abilities)) {
			const state = this.getState(ability.state);
			snapshot[name] = { armed: ability.armed, unlocked: this.level >= ability.unlockLevel, unlockLevel: ability.unlockLevel, manaCost: ability.manaCost, cooldown: state.cooldownTimer, maxCooldown: state.maxCooldown };
		}
		return snapshot;
	}

	get hasArmedAbility() {
		return Object.values(this.combatState.abilities).some(ability => ability.armed);
	}
}
