import { PLAYER_MOVE_SPEED, PLAYER_COMBAT } from "../../../shared/combatConfig.js";
import { Alive }             from "./Alive.js";
import { Enemy }             from "./Enemy.js";
import { BasicAttackState }  from "../../gametick/states/basicAttack/BasicAttackState.js";
import { MovingState }       from "../../gametick/states/MovingState.js";
import { TargetingState }    from "../../gametick/states/TargetingState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }         from "../../gametick/states/DeadState.js";
import { StateName }        from "../../gametick/states/name/StateName.js";

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
				[StateName.DEAD]:         new DeadState(this),
			},
		};
	}

	canAttack(target) {
		return target instanceof Enemy;
	}

	onAttackFinished(targetId) {
		this.getState(StateName.TARGETING).initialize(targetId);
		this.changeState(StateName.TARGETING);
	}
}
