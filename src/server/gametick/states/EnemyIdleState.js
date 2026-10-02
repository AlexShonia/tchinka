export class EnemyIdleState {
	constructor() {
		this.name = "idle";
	}

	tick(actor, _gameData, nearest) {
		const destX = nearest.x + Math.cos(actor.offsetAngle) * actor.attackRange;
		const destZ = nearest.z + Math.sin(actor.offsetAngle) * actor.attackRange;
		const dist  = Math.hypot(destX - actor.x, destZ - actor.z);

		if (dist < 0.08) {
			actor.combatState.states.prep.enter();
			actor.combatState.state = "prep";
		} else {
			actor.x += ((destX - actor.x) / dist) * actor.speed;
			actor.z += ((destZ - actor.z) / dist) * actor.speed;
		}
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
