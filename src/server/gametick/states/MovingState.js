import { BaseState } from "./BaseState.js";

export class MovingState extends BaseState {
	constructor(actor) {
		super();
		this.name       = "moving";
		this.actor      = actor;
		this.moveTarget = null;
	}

	initialize(moveTarget) {
		this.moveTarget = moveTarget;
	}

	initializeAndChangeTo(moveTarget) {
		this.initialize(moveTarget);
		this.actor.combatState.state = this.name;
	}

	tick() {
		const dx   = this.moveTarget.x - this.actor.x;
		const dz   = this.moveTarget.z - this.actor.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= this.actor.moveSpeed) {
			this.actor.x                 = this.moveTarget.x;
			this.actor.z                 = this.moveTarget.z;
			this.actor.combatState.state = "idle";
		} else {
			this.actor.x += (dx / dist) * this.actor.moveSpeed;
			this.actor.z += (dz / dist) * this.actor.moveSpeed;
		}
	}

	processMoveRequest(x, z) {
		this.initialize({ x, z });
	}

	processAttackRequest(targetEnemyId) {
		this.actor.combatState.states.targeting.initializeAndChangeTo(targetEnemyId);
	}
}
