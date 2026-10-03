import { BaseState } from "./base/BaseState.js";
import { State }     from "../transitions/types/State.js";
import { Event }     from "../transitions/types/Event.js";
import { ShoulderChargePhase as Phase } from "../transitions/types/SubState.js";

// Brace, rush at the target and bump it with the shoulder (damage + knockback), then recover.
// Nothing the player does interrupts it: the transition map has no rows for it besides finishing.
export class ShoulderChargeState extends BaseState {
	constructor(actor, config) {
		super(actor, State.SHOULDER_CHARGE);
		this._config       = config;
		this._phase        = Phase.WINDUP;
		this._timer        = 0;
		this.targetId      = null;
		this.maxCooldown   = config.cooldownTicks;
		this.cooldownTimer = 0;
	}

	get substate() {
		return this._phase;
	}

	// recovery is not drawn as the charge, the client just sees us idle
	get visualState() {
		return this._phase === Phase.RECOVERY ? State.IDLE : this.name;
	}

	passiveTick() {
		if (this.cooldownTimer > 0) this.cooldownTimer--;
	}

	initialize({ targetId }) {
		this.targetId      = targetId;
		this._phase        = Phase.WINDUP;
		this._timer        = this._config.windupTicks;
		this.cooldownTimer = this.maxCooldown;
	}

	tick(gameData) {
		const actor  = this.actor;
		const config = this._config;
		const target = gameData.findAlive(this.targetId);
		const valid  = target && !target.isDead && actor.canAttack(target);

		if (this._phase === Phase.WINDUP) {
			if (valid) actor.faceTowards(target);
			if (--this._timer > 0) return;
			this._phase = valid ? Phase.RUSH : Phase.RECOVERY;
			this._timer = config.recoveryTicks;
			return;
		}

		if (this._phase === Phase.RUSH) {
			if (!valid) { this._phase = Phase.RECOVERY; return; }
			actor.faceTowards(target);
			const dx   = target.x - actor.x;
			const dz   = target.z - actor.z;
			const dist = Math.hypot(dx, dz);
			if (dist > config.bumpDistance) {
				const step = Math.min(config.speed, dist - config.bumpDistance);
				actor.x += (dx / dist) * step;
				actor.z += (dz / dist) * step;
				if (dist - step > config.bumpDistance) return;
			}
			const nx = dist > 0 ? dx / dist : Math.sin(actor.facing);
			const nz = dist > 0 ? dz / dist : Math.cos(actor.facing);
			target.takeDamage(actor.damage * config.damageMultiplier);
			target.x += nx * config.knockback;
			target.z += nz * config.knockback;
			this._phase = Phase.RECOVERY;
			return;
		}

		if (--this._timer > 0) return;
		actor.transition(Event.ABILITY_FINISHED);
	}
}
