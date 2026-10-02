export class MovingState {
	constructor() {
		this.name       = "moving";
		this.moveTarget = null;
	}

	initialize(moveTarget) {
		this.moveTarget = moveTarget;
	}

	initializeAndChangeTo(actor, moveTarget) {
		this.initialize(moveTarget);
		actor.combatState.state = this.name;
	}

	tick(actor) {
		const dx   = this.moveTarget.x - actor.x;
		const dz   = this.moveTarget.z - actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= actor.moveSpeed) {
			actor.x                 = this.moveTarget.x;
			actor.z                 = this.moveTarget.z;
			actor.combatState.state = "idle";
		} else {
			actor.x += (dx / dist) * actor.moveSpeed;
			actor.z += (dz / dist) * actor.moveSpeed;
		}
	}

	processMoveRequest(actor, x, z) {
		this.initialize({ x, z });
	}

	processAttackRequest(actor, enemyId) {
		actor.combatState.states.targeting.initializeAndChangeTo(actor, enemyId);
	}
}
