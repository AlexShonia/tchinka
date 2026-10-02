import { PLAYER_MOVE_SPEED, PLAYER_COMBAT } from "../../../shared/combatConfig.js";
import { WindupState }   from "../../gametick/states/WindupState.js";
import { AttackState }   from "../../gametick/states/AttackState.js";
import { RecoveryState } from "../../gametick/states/RecoveryState.js";
import { CooldownState } from "../../gametick/states/CooldownState.js";
import { MovingState }   from "../../gametick/states/MovingState.js";
import { TargetingState } from "../../gametick/states/TargetingState.js";

export class Player {
	constructor(id) {
		this.id          = id;
		this.x           = 0;
		this.z           = 0;
		this.health      = 100;
		this.mana        = 100;
		this.state       = "idle";
		this.dead        = false;
		this.hit         = false;
		this.moveSpeed   = PLAYER_MOVE_SPEED;
		this.attackRange = 3;
		this.attackSpeed = 1;
		this.states = {
			windup:    new WindupState(PLAYER_COMBAT.windupTicks),
			attack:    new AttackState(PLAYER_COMBAT.attackTicks),
			recovery:  new RecoveryState(PLAYER_COMBAT.recoveryTicks),
			cooldown:  new CooldownState(PLAYER_COMBAT.cooldownTicks),
			moving:    new MovingState(),
			targeting: new TargetingState(),
		};
	}
}
