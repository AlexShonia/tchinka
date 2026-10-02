import { ENEMY_COMBAT }    from "../../../shared/combatConfig.js";
import { Alive }            from "./Alive.js";
import { BasicAttackState } from "../../gametick/states/basicAttack/BasicAttackState.js";
import { ChaseNearestPlayerState }        from "../../gametick/states/ChaseNearestPlayerState.js";
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
			state: "prep",
			states: {
				basicAttack: new BasicAttackState(this, ENEMY_COMBAT.windupTicks, ENEMY_COMBAT.attackTicks, ENEMY_COMBAT.recoveryTicks),
				prep:        new ChaseNearestPlayerState(this, ENEMY_COMBAT.prepTicks),
				dead:        new DeadState(this),
			},
		};
	}
}
