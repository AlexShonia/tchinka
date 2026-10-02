import { BaseState }  from "../base/BaseState.js";
import { StateName }  from "../name/StateName.js";
import { StateEvent } from "../name/StateEvent.js";

export class AttackState extends BaseState {
	constructor(actor, hitTicks) {
		super(actor, StateName.HIT);
		this._hitTicks = hitTicks;
		this._timer    = 0;
		this._landed   = false;
		this.targetId  = null;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._timer   = Math.max(1, Math.round(this._hitTicks / this.actor.attackSpeed));
		this._landed  = false;
		this.actor.getState(StateName.RECOVERY).startCooldown(this._hitTicks); // cooldown covers hit + recovery, so it starts with the hit
	}

	tick(gameData) {
		if (!this._landed) {
			this._landed = true;
			const target = gameData.findAlive(this.targetId);
			this.actor.faceTowards(target);
			this.actor.hitTarget(target);
		}
		if (--this._timer > 0) return;
		this.actor.transition(StateEvent.HIT_FINISHED, { targetId: this.targetId });
	}
}
