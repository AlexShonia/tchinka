import { BaseState }  from "../base/BaseState.js";
import { StateName }  from "../name/StateName.js";
import { StateEvent } from "../name/StateEvent.js";

// Straighten up after the landing. Waits for the shared attack cooldown (started by JumpAirState), cancellable by a move.
export class JumpRecoveryState extends BaseState {
	constructor(actor) {
		super(actor, StateName.JUMP_RECOVERY);
		this.targetId = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
	}

	tick(gameData) {
		if (this.actor.isAttackOnCooldown) return;
		this.actor.transition(StateEvent.RECOVERY_FINISHED, { targetId: this.targetId });
	}
}
