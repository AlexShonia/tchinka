import { ENEMY_COMBAT }    from "../../../shared/combatConfig.js";
import { Alive }            from "./Alive.js";
import { Player }           from "./Player.js";
import { WindupState }      from "../../gametick/states/attack/WindupState.js";
import { AttackState }      from "../../gametick/states/attack/AttackState.js";
import { RecoveryState }    from "../../gametick/states/attack/RecoveryState.js";
import { ChaseAroundState } from "../../gametick/states/ChaseAroundState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }        from "../../gametick/states/DeadState.js";
import { StateName }        from "../../gametick/states/name/StateName.js";
import { nearestTarget }    from "../../utils/nearest.js";
import { EnemyTransitions } from "../../gametick/transitions/EnemyTransitions.js";

export class Enemy extends Alive {
	constructor(id, x, z, hp, speed, attackRange = 1.5) {
		super();
		this.id          = id;
		this.x           = x;
		this.z           = z;
		this.maxHp       = hp;
		this.health      = hp;
		this.moveSpeed   = speed;
		this.attackRange = attackRange;
		this.damage      = ENEMY_COMBAT.damage;

		this.combatState = {
			state: StateName.IDLE,
			states: {
				[StateName.IDLE]:         new IdleState(this),
				[StateName.WINDUP]:       new WindupState(this, ENEMY_COMBAT.windupTicks),
				[StateName.HIT]:          new AttackState(this, ENEMY_COMBAT.attackTicks),
				[StateName.RECOVERY]:     new RecoveryState(this, ENEMY_COMBAT.recoveryTicks),
				[StateName.CHASE_AROUND]: new ChaseAroundState(this),
				[StateName.DEAD]:         new DeadState(this),
			},
			transitions: EnemyTransitions,
		};
	}

	canAttack(target) {
		return target instanceof Player;
	}

	findTarget(gameData) {
		return nearestTarget(this, gameData);
	}
}
