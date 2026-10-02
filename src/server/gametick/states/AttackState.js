import { BaseState }  from "./base/BaseState.js";
import { StateName }  from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

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
			this._damageTarget(gameData);
		}
		if (--this._timer > 0) return;
		this.actor.transition(StateEvent.HIT_FINISHED, { targetId: this.targetId });
	}

	_damageTarget(gameData) {
		const actor  = this.actor;
		const target = gameData.findAlive(this.targetId);
		if (!target || target.isDead || !actor.canAttack(target)) return;
		if (Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;
		target.takeDamage(actor.damage);
	}
}
