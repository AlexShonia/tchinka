import { BaseState }  from "./base/BaseState.js";
import { State }  from "../transitions/types/State.js";
import { Event } from "../transitions/types/Event.js";

const Phase = Object.freeze({ WINDUP: "windup", HIT: "hit", RECOVERY: "recovery" });

export class BasicAttackState extends BaseState {
	constructor(actor, windupTicks, hitTicks, recoveryTicks) {
		super(actor, State.BASIC_ATTACK);
		this._windupTicks   = windupTicks;
		this._hitTicks      = hitTicks;
		this._recoveryTicks = recoveryTicks;
		this._phase         = Phase.WINDUP;
		this._timer         = 0;
		this.targetId       = null;
		this.recoveryTimer  = 0;     // the attack cooldown: starts with the hit, counts down in passiveTick even while we are in another state
	}

	// recovery (also when we only wait out a cooldown) is not drawn as an attack, the client just sees us idle
	get visualState() {
		return this._phase === Phase.RECOVERY ? State.IDLE : this.name;
	}

	passiveTick() {
		if (this.recoveryTimer > 0) this.recoveryTimer--;
	}

	// cooldown covers the hit + recovery, `hitTicks` is whatever hit-like phase started it (also used by the jump)
	startCooldown(hitTicks) {
		this.recoveryTimer = this._scaled(hitTicks + this._recoveryTicks);
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._phase   = this.recoveryTimer > 0 ? Phase.RECOVERY : Phase.WINDUP;
		this._timer   = this._scaled(this._windupTicks);
	}

	tick(gameData) {
		const target = gameData.findAlive(this.targetId);
		this.actor.faceTowards(target);

		if (this.actor.hasArmedAbility) { // abilities have their own cooldown, they don't wait for the attack
			this.actor.transition(Event.ABILITY_ARMED, { targetId: this.targetId });
			return;
		}

		if (this._phase === Phase.WINDUP) {
			if (--this._timer > 0) return;
			this._phase = Phase.HIT;
			this._timer = this._scaled(this._hitTicks);
			this.startCooldown(this._hitTicks);
			this.actor.hitTarget(target);
			return;
		}

		if (this._phase === Phase.HIT) {
			if (--this._timer > 0) return;
			this._phase = Phase.RECOVERY;
			return;
		}

		if (this.recoveryTimer > 0) return; // recovery lasts until the cooldown is over
		this.actor.transition(Event.ATTACK_FINISHED, { targetId: this.targetId });
	}

	_scaled(ticks) {
		return Math.max(1, Math.round(ticks / this.actor.attackSpeed));
	}
}
