import { BaseState } from "./base/BaseState.js";
import { StateName }        from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

export class TargetingState extends BaseState {
	constructor(actor) {
		super(actor, StateName.TARGETING);
		this.targetId = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
	}

	tick(gameData) {
		const target = gameData.findAlive(this.targetId);
		if (!target || target.isDead || !this.actor.canAttack(target)) {
			this.actor.transition(StateEvent.TARGET_LOST);
			return;
		}

		const dist = Math.hypot(target.x - this.actor.x, target.z - this.actor.z);
		if (dist <= this.actor.attackRange) {
			const event = this.actor.isAttackOnCooldown ? StateEvent.ATTACK_ON_COOLDOWN : StateEvent.TARGET_REACHED;
			this.actor.transition(event, { targetId: this.targetId });
			return;
		}

		const angle = Math.atan2(target.z - this.actor.z, target.x - this.actor.x);
		const destX = target.x - Math.cos(angle) * (this.actor.attackRange * 0.8);
		const destZ = target.z - Math.sin(angle) * (this.actor.attackRange * 0.8);
		const dx    = destX - this.actor.x;
		const dz    = destZ - this.actor.z;
		const d     = Math.hypot(dx, dz);
		if (d > this.actor.moveSpeed) {
			this.actor.x += (dx / d) * this.actor.moveSpeed;
			this.actor.z += (dz / d) * this.actor.moveSpeed;
		} else {
			this.actor.x = destX;
			this.actor.z = destZ;
		}
	}
}
