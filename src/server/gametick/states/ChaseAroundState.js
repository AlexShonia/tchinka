import { BaseState } from "./base/BaseState.js";
import { StateName }        from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

const STAND_RANGE = 0.8; // stand a bit inside attackRange, standing exactly on it makes hits borderline

export class ChaseAroundState extends BaseState {
	constructor(actor) {
		super(actor, StateName.CHASE_AROUND);
		this._offsetAngle = Math.random() * Math.PI * 2;
		this.targetId     = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
	}

	tick(gameData) { //TODO this chace logic runs on every tick maybe weird
		const target = gameData.findAlive(this.targetId);
		if (!target || target.isDead) {
			this.actor.transition(StateEvent.TARGET_LOST);
			return;
		}

		const destX = target.x + Math.cos(this._offsetAngle) * this.actor.attackRange * STAND_RANGE;
		const destZ = target.z + Math.sin(this._offsetAngle) * this.actor.attackRange * STAND_RANGE;
		const dist  = Math.hypot(destX - this.actor.x, destZ - this.actor.z);

		if (dist > 0.08) {
			this.actor.x    += ((destX - this.actor.x) / dist) * this.actor.moveSpeed;
			this.actor.z    += ((destZ - this.actor.z) / dist) * this.actor.moveSpeed;
			return;
		}

		this.actor.transition(StateEvent.TARGET_REACHED, { targetId: this.targetId });
	}
}
