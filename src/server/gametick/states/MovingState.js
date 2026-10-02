import { BaseState } from "./base/BaseState.js";
import { StateName }        from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

export class MovingState extends BaseState {
	constructor(actor) {
		super(actor, StateName.MOVING);
		this.moveTarget = null;
	}

	initialize({ moveTarget }) {
		this.moveTarget = moveTarget;
	}

	tick() {
		const dx   = this.moveTarget.x - this.actor.x;
		const dz   = this.moveTarget.z - this.actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= this.actor.moveSpeed) {
			this.actor.x = this.moveTarget.x;
			this.actor.z = this.moveTarget.z;
			this.actor.transition(StateEvent.ARRIVED);
		} else {
			this.actor.x += (dx / dist) * this.actor.moveSpeed;
			this.actor.z += (dz / dist) * this.actor.moveSpeed;
		}
	}
}
