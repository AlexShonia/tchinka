import { BaseState } from "./base/BaseState.js";

export class MovingState extends BaseState {
	constructor(actor) {
		super(actor, "moving");
		this.moveTarget = null;
	}

	initialize(moveTarget) {
		this.moveTarget = moveTarget;
	}

	tick() {
		const dx   = this.moveTarget.x - this.actor.x;
		const dz   = this.moveTarget.z - this.actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= this.actor.moveSpeed) {
			this.actor.x = this.moveTarget.x;
			this.actor.z = this.moveTarget.z;
			this.actor.changeState("idle");
		} else {
			this.actor.x += (dx / dist) * this.actor.moveSpeed;
			this.actor.z += (dz / dist) * this.actor.moveSpeed;
		}
	}

	processMoveRequest(x, z) {
		this.initialize({ x, z });
	}

	processAttackRequest(targetEnemyId) {
		this.actor.combatState.states.targeting.initialize(targetEnemyId);
		this.actor.changeState("targeting");
	}
}
