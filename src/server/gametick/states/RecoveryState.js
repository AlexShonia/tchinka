import { BaseState }  from "./base/BaseState.js";
import { StateName }  from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

export class RecoveryState extends BaseState {
	constructor(actor, recoveryTicks) {
		super(actor, StateName.RECOVERY);
		this._recoveryTicks = recoveryTicks;
		this.recoveryTimer  = 0; // the attack cooldown: counts down in passiveTick, also while we are in another state
		this.targetId       = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
	}

	startCooldown(hitTicks) {
		this.recoveryTimer = Math.max(1, Math.round((hitTicks + this._recoveryTicks) / this.actor.attackSpeed));
	}

	passiveTick() {
		if (this.recoveryTimer > 0) this.recoveryTimer--;
	}

	tick(gameData) {
		if (this.recoveryTimer > 0) return;
		this.actor.transition(StateEvent.RECOVERY_FINISHED, { targetId: this.targetId });
	}
}
