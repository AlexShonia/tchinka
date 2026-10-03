import { BaseState } from "./base/BaseState.js";
import { State }        from "../transitions/types/State.js";
import { Event } from "../transitions/types/Event.js";

export class MovingState extends BaseState {
	constructor(actor) {
		super(actor, State.MOVING);
		this.moveTarget = null;
	}

	initialize({ moveTarget }) {
		this.moveTarget = moveTarget;
		this.actor.faceTowards(moveTarget);
	}

	tick() {
		const dx   = this.moveTarget.x - this.actor.x;
		const dz   = this.moveTarget.z - this.actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= this.actor.moveSpeed) {
			this.actor.x = this.moveTarget.x;
			this.actor.z = this.moveTarget.z;
			this.actor.transition(Event.ARRIVED);
		} else {
			this.actor.x += (dx / dist) * this.actor.moveSpeed;
			this.actor.z += (dz / dist) * this.actor.moveSpeed;
		}
	}
}
