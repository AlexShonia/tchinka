import { PLAYER_MOVE_SPEED, PLAYER_COMBAT, PLAYER_JUMP } from "../../../shared/combatConfig.js";
import { Alive }             from "./Alive.js";
import { Enemy }             from "./Enemy.js";
import { BasicAttackState }  from "../../gametick/states/BasicAttackState.js";
import { JumpAttackState }   from "../../gametick/states/JumpAttackState.js";
import { MovingState }       from "../../gametick/states/MovingState.js";
import { TargetingState }    from "../../gametick/states/TargetingState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }         from "../../gametick/states/DeadState.js";
import { StateName }        from "../../gametick/states/name/StateName.js";
import { AbilityName }       from "../../gametick/states/name/AbilityName.js";
import { PlayerTransitions } from "../../gametick/transitions/PlayerTransitions.js";

export class Player extends Alive {
	constructor(id) {
		super();
		this.id                  = id;
		this.mana                = 100;
		this.attackRange         = 3;
		this.health              = 100;
		this.moveSpeed           = PLAYER_MOVE_SPEED;
		this.damage              = PLAYER_COMBAT.damage;

		this.combatState = {
			state: StateName.IDLE,
			states: {
				[StateName.IDLE]:         new IdleState(this),
				[StateName.MOVING]:       new MovingState(this),
				[StateName.TARGETING]:    new TargetingState(this),
				[StateName.BASIC_ATTACK]: new BasicAttackState(this, PLAYER_COMBAT.windupTicks, PLAYER_COMBAT.attackTicks, PLAYER_COMBAT.recoveryTicks),
				[StateName.JUMP_ATTACK]:  new JumpAttackState(this, PLAYER_JUMP.windupTicks, PLAYER_JUMP.airTicks, PLAYER_JUMP.damageMultiplier, PLAYER_JUMP.cooldownTicks),
				[StateName.DEAD]:         new DeadState(this),
			},
			transitions: PlayerTransitions,
			abilities: {
				[AbilityName.JUMPING_ATTACK]: { armed: false, state: StateName.JUMP_ATTACK } // JUMP_ATTACK owns the ability cooldown
			},
		};
	}

	canAttack(target) {
		return target instanceof Enemy;
	}

	// arms the ability; the attack state notices it on its next tick (also while an attack is already running)
	useAbility(name) {
		const ability = this.combatState.abilities[name];
		if (!ability || this.isDead || this.getState(ability.state).cooldownTimer > 0) return;
		ability.armed = true;
	}

	// what the client needs to draw the abilities: armed flag and cooldown (in ticks) per ability
	get abilitySnapshot() {
		const snapshot = {};
		for (const [name, ability] of Object.entries(this.combatState.abilities)) {
			const state = this.getState(ability.state);
			snapshot[name] = { armed: ability.armed, cooldown: state.cooldownTimer, maxCooldown: state.maxCooldown };
		}
		return snapshot;
	}

	get hasArmedAbility() {
		return Object.values(this.combatState.abilities).some(ability => ability.armed);
	}
}
