import { BaseState }      from "./base/BaseState.js";
import { State }          from "../transitions/types/State.js";
import { Event }          from "../transitions/types/Event.js";
import { targetsWithin }  from "../../utils/nearest.js";

// Spins for a while and damages everything close, a little every tick. The player may still walk:
// MOVE_REQUESTED maps back to this same state, which then only takes the new moveTarget and keeps the timer.
export class SpinAttackState extends BaseState {
	constructor(actor, config) {
		super(actor, State.SPIN_ATTACK);
		this._config       = config;
		this._timer        = 0; // > 0 = a spin is running
		this.moveTarget    = null;
		this.maxCooldown   = config.cooldownTicks;
		this.cooldownTimer = 0;
	}

	passiveTick() {
		if (this.cooldownTimer > 0) this.cooldownTimer--;
	}

	initialize({ moveTarget }) {
		this.moveTarget = moveTarget ?? this.moveTarget;
		if (this._timer > 0) return; // walking while spinning: don't restart
		this._timer        = this._config.durationTicks;
		this.cooldownTimer = this.maxCooldown;
	}

	tick(gameData) {
		const actor  = this.actor;
		const config = this._config;

		for (const t of targetsWithin(actor, gameData, actor.x, actor.z, config.radius))
			t.takeDamage(actor.damage * config.damageMultiplier);

		if (this.moveTarget) {
			const dx    = this.moveTarget.x - actor.x;
			const dz    = this.moveTarget.z - actor.z;
			const dist  = Math.hypot(dx, dz);
			const speed = actor.moveSpeed * config.moveSpeedMultiplier;
			if (dist <= speed) {
				actor.x = this.moveTarget.x;
				actor.z = this.moveTarget.z;
				this.moveTarget = null;
			} else {
				actor.x += (dx / dist) * speed;
				actor.z += (dz / dist) * speed;
			}
		}

		if (--this._timer > 0) return;
		this.moveTarget = null;
		actor.transition(Event.ABILITY_FINISHED);
	}
}
