import { BaseState }      from "./base/BaseState.js";
import { State }          from "../transitions/types/State.js";
import { Event }          from "../transitions/types/Event.js";
import { ShieldThrowPhase as Phase } from "../transitions/types/SubState.js";
import { targetsWithin }  from "../../utils/nearest.js";

const MAX_FLIGHT_TICKS = 300; // safety net: after this the shield comes home no matter what

// Throws the shield at a target; it bounces to random other enemies in range and flies home once nobody else can be hit.
// The player is stuck (the map has no rows for it) until the shield is caught.
export class ShieldThrowState extends BaseState {
	constructor(actor, config) {
		super(actor, State.SHIELD_THROW);
		this._config       = config;
		this._phase        = Phase.WINDUP;
		this._timer        = 0;
		this._flightTicks  = 0;
		this._bounces      = 0;
		this._lastHitId    = null;
		this.targetId      = null;
		this.shield        = null; // { x, z } while it is out, sent to the client to draw
		this.maxCooldown   = config.cooldownTicks;
		this.cooldownTimer = 0;
	}

	get substate() {
		return this._phase;
	}

	passiveTick() {
		if (this.cooldownTimer > 0) this.cooldownTimer--;
	}

	initialize({ targetId }) {
		this.targetId      = targetId;
		this._phase        = Phase.WINDUP;
		this._timer        = this._config.windupTicks;
		this._flightTicks  = 0;
		this._bounces      = 0;
		this._lastHitId    = null;
		this.shield        = null;
		this.cooldownTimer = this.maxCooldown;
	}

	tick(gameData) {
		const actor = this.actor;

		if (this._phase === Phase.WINDUP) {
			const target = gameData.findAlive(this.targetId);
			if (target) actor.faceTowards(target);
			if (--this._timer > 0) return;
			this.shield = { x: actor.x, z: actor.z };
			this._phase = target && !target.isDead ? Phase.FLIGHT : Phase.RETURN;
			return;
		}

		if (this._phase === Phase.FLIGHT) {
			if (++this._flightTicks > MAX_FLIGHT_TICKS) { this._phase = Phase.RETURN; return; }
			let target = gameData.findAlive(this.targetId);
			if (!target || target.isDead) { // died under the shield's feet: look for a new one
				target = this._pickTarget(gameData);
				if (!target) { this._phase = Phase.RETURN; return; }
				this.targetId = target.id;
			}
			if (!this._flyToward(target, this._config.hitRadius)) return;

			target.takeDamage(actor.damage * this._config.damageMultiplier);
			this._lastHitId = target.id;
			const next = ++this._bounces < this._config.maxBounces ? this._pickTarget(gameData) : null;
			if (next) this.targetId = next.id;
			else this._phase = Phase.RETURN;
			return;
		}

		if (!this._flyToward(actor, this._config.catchDistance)) return;
		this.shield = null;
		actor.transition(Event.ABILITY_FINISHED);
	}

	// random enemy near the shield, never the one it just bounced off
	_pickTarget(gameData) {
		const options = targetsWithin(this.actor, gameData, this.shield.x, this.shield.z, this._config.bounceRange)
			.filter(t => t.id !== this._lastHitId);
		return options.length ? options[Math.floor(Math.random() * options.length)] : null;
	}

	// moves the shield toward the point; returns whether it is within `reach` of it
	_flyToward(point, reach) {
		const dx   = point.x - this.shield.x;
		const dz   = point.z - this.shield.z;
		const dist = Math.hypot(dx, dz);
		if (dist <= reach) return true;
		const step = Math.min(this._config.speed, dist - reach);
		this.shield.x += (dx / dist) * step;
		this.shield.z += (dz / dist) * step;
		return dist - step <= reach;
	}
}
