import { PLAYER_MOVE_SPEED, PLAYER_COMBAT } from "../../../shared/combatConfig.js";
import { Alive }             from "./Alive.js";
import { BasicAttackState }  from "../../gametick/states/basicAttack/BasicAttackState.js";
import { MovingState }       from "../../gametick/states/MovingState.js";
import { TargetingState }    from "../../gametick/states/TargetingState.js";
import { IdleState }         from "../../gametick/states/IdleState.js";
import { DeadState }         from "../../gametick/states/DeadState.js";

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
			state: "idle",
			states: {
				idle:         new IdleState(this),
				moving:       new MovingState(this),
				targeting:    new TargetingState(this),
				basicAttack:  new BasicAttackState(this, PLAYER_COMBAT.windupTicks, PLAYER_COMBAT.attackTicks, PLAYER_COMBAT.recoveryTicks),
				dead:         new DeadState(this),
			},
		};
	}
}
