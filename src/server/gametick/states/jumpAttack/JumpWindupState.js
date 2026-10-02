import { BaseState }  from "../base/BaseState.js";
import { StateName }  from "../name/StateName.js";
import { StateEvent } from "../name/StateEvent.js";

// Crouch and tilt back before the leap. Cancellable by the map; nothing is spent yet, the ability stays armed.
export class JumpWindupState extends BaseState {
	constructor(actor, windupTicks) {
		super(actor, StateName.JUMP_WINDUP);
		this._windupTicks = windupTicks;
		this._timer       = 0;
		this.targetId     = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._timer   = Math.max(1, Math.round(this._windupTicks / this.actor.attackSpeed));
	}

	tick(gameData) {
		this.actor.faceTowards(gameData.findAlive(this.targetId));
		if (--this._timer > 0) return;
		this.actor.transition(StateEvent.WINDUP_FINISHED, { targetId: this.targetId });
	}
}
