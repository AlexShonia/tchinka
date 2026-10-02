import { BaseState }  from "./base/BaseState.js";
import { StateName }  from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

export class WindupState extends BaseState {
	constructor(actor, windupTicks) {
		super(actor, StateName.WINDUP);
		this._windupTicks = windupTicks;
		this._timer       = 0;
		this.targetId     = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._timer   = Math.max(1, Math.round(this._windupTicks / this.actor.attackSpeed));
	}

	tick(gameData) {
		if (this.actor.isAttackOnCooldown) return; // reached the target before the last attack's cooldown ended: hold until it does
		if (--this._timer > 0) return;
		this.actor.transition(StateEvent.WINDUP_FINISHED, { targetId: this.targetId });
	}
}
