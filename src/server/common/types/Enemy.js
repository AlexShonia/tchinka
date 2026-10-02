import { ENEMY_COMBAT } from "../../../shared/combatConfig.js";
import { WindupState }   from "../../gametick/states/WindupState.js";
import { AttackState }   from "../../gametick/states/AttackState.js";
import { RecoveryState } from "../../gametick/states/RecoveryState.js";
import { PrepState }     from "../../gametick/states/PrepState.js";

export class Enemy {
	constructor(id, x, z, hp, speed, attackRange = 2.5) {
		this.id          = id;
		this.x           = x;
		this.z           = z;
		this.hp          = hp;
		this.maxHp       = hp;
		this.speed       = speed;
		this.attackRange = attackRange;
		this.attackSpeed = 1;
		this.offsetAngle = Math.random() * Math.PI * 2;
		this.state       = "idle";
		this.states = {
			windup:   new WindupState(ENEMY_COMBAT.windupTicks),
			attack:   new AttackState(ENEMY_COMBAT.attackTicks),
			recovery: new RecoveryState(ENEMY_COMBAT.recoveryTicks),
			prep:     new PrepState(ENEMY_COMBAT.prepTicks),
		};
	}
}
