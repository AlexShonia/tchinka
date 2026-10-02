import { ENEMY_COMBAT }    from "../../../shared/combatConfig.js";
import { Alive }            from "./Alive.js";
import { BasicAttackState } from "../../gametick/states/basicAttack/BasicAttackState.js";
import { PrepState }        from "../../gametick/states/PrepState.js";
import { EnemyIdleState }   from "../../gametick/states/EnemyIdleState.js";
import { DeadState }        from "../../gametick/states/DeadState.js";

export class Enemy extends Alive {
	constructor(id, x, z, hp, speed, attackRange = 2.5) {
		super();
		this.id          = id;
		this.x           = x;
		this.z           = z;
		this.maxHp       = hp;
		this.health      = hp;
		this.speed       = speed;
		this.attackRange = attackRange;
		this.damage      = ENEMY_COMBAT.damage;
		this.offsetAngle = Math.random() * Math.PI * 2;

		this.combatState = {
			state: "idle",
			states: {
				idle:        new EnemyIdleState(),
				basicAttack: new BasicAttackState(ENEMY_COMBAT.windupTicks, ENEMY_COMBAT.attackTicks, ENEMY_COMBAT.recoveryTicks),
				prep:        new PrepState(ENEMY_COMBAT.prepTicks),
				dead:        new DeadState(),
			},
		};
	}
}
