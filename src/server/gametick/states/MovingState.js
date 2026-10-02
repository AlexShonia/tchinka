export class MovingState {
	constructor() {
		this.name       = "moving";
		this.moveTarget = null;
	}

	enter(moveTarget) {
		this.moveTarget = moveTarget;
	}

	tick(actor) {
		const dx   = this.moveTarget.x - actor.x;
		const dz   = this.moveTarget.z - actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= actor.moveSpeed) {
			actor.x     = this.moveTarget.x;
			actor.z     = this.moveTarget.z;
			actor.state = "idle";
		} else {
			actor.x += (dx / dist) * actor.moveSpeed;
			actor.z += (dz / dist) * actor.moveSpeed;
		}
	}
}
