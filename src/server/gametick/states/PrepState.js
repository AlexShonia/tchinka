import { nearestPlayer } from "../../utils/nearest.js";

export class PrepState {
	constructor(baseTicks) {
		this.name       = "prep";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	initialize() {
		this._timer = this._baseTicks;
	}

	initializeAndChangeTo(actor) {
		this.initialize();
		actor.combatState.state = this.name;
	}

	tick(actor, gameData) {
		const nearest = nearestPlayer(actor, gameData);
		if (!nearest) { actor.combatState.state = "idle"; return; }

		const destX = nearest.x + Math.cos(actor.offsetAngle) * actor.attackRange;
		const destZ = nearest.z + Math.sin(actor.offsetAngle) * actor.attackRange;
		const dist  = Math.hypot(destX - actor.x, destZ - actor.z);

		if (dist > 0.3) {
			actor.combatState.state = "idle";
			actor.offsetAngle       = Math.random() * Math.PI * 2;
			return;
		}

		if (--this._timer > 0) return;
		actor.combatState.states.basicAttack.initializeAndChangeTo(actor, actor.attackSpeed);
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
