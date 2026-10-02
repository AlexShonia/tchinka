import { nearestPlayer } from "../../utils/nearest.js";

export class EnemyIdleState {
	constructor(actor) {
		this.name  = "idle";
		this.actor = actor;
	}

	tick(gameData) {
		const nearest = nearestPlayer(this.actor, gameData);
		if (!nearest) return;

		const destX = nearest.x + Math.cos(this.actor.offsetAngle) * this.actor.attackRange;
		const destZ = nearest.z + Math.sin(this.actor.offsetAngle) * this.actor.attackRange;
		const dist  = Math.hypot(destX - this.actor.x, destZ - this.actor.z);

		if (dist < 0.08) {
			this.actor.combatState.states.prep.initializeAndChangeTo();
		} else {
			this.actor.x += ((destX - this.actor.x) / dist) * this.actor.speed;
			this.actor.z += ((destZ - this.actor.z) / dist) * this.actor.speed;
		}
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
