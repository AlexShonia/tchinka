import { nearestPlayer } from "../../utils/nearest.js";

export class EnemyIdleState {
	constructor() {
		this.name = "idle";
	}

	tick(actor, gameData) {
		const nearest = nearestPlayer(actor, gameData);
		if (!nearest) return;

		const destX = nearest.x + Math.cos(actor.offsetAngle) * actor.attackRange;
		const destZ = nearest.z + Math.sin(actor.offsetAngle) * actor.attackRange;
		const dist  = Math.hypot(destX - actor.x, destZ - actor.z);

		if (dist < 0.08) {
			actor.combatState.states.prep.initializeAndChangeTo(actor);
		} else {
			actor.x += ((destX - actor.x) / dist) * actor.speed;
			actor.z += ((destZ - actor.z) / dist) * actor.speed;
		}
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
