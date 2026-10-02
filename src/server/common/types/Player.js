import { PLAYER_MOVE_SPEED, PLAYER_COMBAT, PLAYER_JUMP } from "../../../shared/combatConfig.js";
import { Alive }             from "./Alive.js";
import { Enemy }             from "./Enemy.js";
import { WindupState }       from "../../gametick/states/attack/WindupState.js";
import { AttackState }       from "../../gametick/states/attack/AttackState.js";
import { RecoveryState }     from "../../gametick/states/attack/RecoveryState.js";
import { JumpWindupState }   from "../../gametick/states/jumpAttack/JumpWindupState.js";
import { JumpAirState }      from "../../gametick/states/jumpAttack/JumpAirState.js";
import { JumpRecoveryState } from "../../gametick/states/jumpAttack/JumpRecoveryState.js";
import { MovingState }       from "../../gametick/states/MovingState.js";
import { TargetingState }    from "../../gametick/states/TargetingState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }         from "../../gametick/states/DeadState.js";
import { StateName }        from "../../gametick/states/name/StateName.js";
import { StateEvent }        from "../../gametick/states/name/StateEvent.js";
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
				[StateName.WINDUP]:       new WindupState(this, PLAYER_COMBAT.windupTicks),
				[StateName.HIT]:          new AttackState(this, PLAYER_COMBAT.attackTicks),
				[StateName.RECOVERY]:     new RecoveryState(this, PLAYER_COMBAT.recoveryTicks),
				[StateName.JUMP_WINDUP]:  new JumpWindupState(this, PLAYER_JUMP.windupTicks),
				[StateName.JUMP_AIR]:     new JumpAirState(this, PLAYER_JUMP.airTicks, PLAYER_JUMP.damageMultiplier, PLAYER_JUMP.cooldownTicks),
				[StateName.JUMP_RECOVERY]: new JumpRecoveryState(this),
				[StateName.DEAD]:         new DeadState(this),
			},
			transitions: PlayerTransitions,
			abilities: {
				[AbilityName.JUMPING_ATTACK]: { armed: false, state: StateName.JUMP_AIR } // JUMP_AIR owns the ability cooldown,
			},
		};
	}

	canAttack(target) {
		return target instanceof Enemy;
	}

	// arms the ability for the next attack; if we are in the middle of an attack, the map may let it cut in right now
	useAbility(name) {
		const ability = this.combatState.abilities[name];
		if (!ability || this.isDead || this.getState(ability.state).cooldownTimer > 0) return;
		ability.armed = true;
		this.transition(StateEvent.ABILITY_REQUESTED, { targetId: this.currentState.targetId });
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
