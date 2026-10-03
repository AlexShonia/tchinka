import { BaseState }   from "./base/BaseState.js";
import { State }   from "../transitions/types/State.js";
import { Event }  from "../transitions/types/Event.js";
import { AbilityName } from "./name/AbilityName.js";

const Phase = Object.freeze({ WINDUP: "windup", AIR: "air", RECOVERY: "recovery" });

// Crouch and tilt back, leap straight up and down, then recover. The ability is only spent if the landing actually damages someone.
export class JumpAttackState extends BaseState {
	constructor(actor, windupTicks, airTicks, damageMultiplier, cooldownTicks) {
		super(actor, State.JUMP_ATTACK);
		this._windupTicks      = windupTicks;
		this._airTicks         = airTicks;
		this._damageMultiplier = damageMultiplier;
		this._phase            = Phase.WINDUP;
		this._timer            = 0;
		this.targetId          = null;
		this.maxCooldown       = cooldownTicks;
		this.cooldownTimer     = 0; // the ability's own cooldown, separate from the attack cooldown on BasicAttackState
	}

	// recovery is not drawn as an attack, the client just sees us idle
	get visualState() {
		return this._phase === Phase.RECOVERY ? State.IDLE : this.name;
	}

	passiveTick() {
		if (this.cooldownTimer > 0) this.cooldownTimer--;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._phase   = Phase.WINDUP;
		this._timer   = this._scaled(this._windupTicks);
	}

	tick(gameData) {
		const actor  = this.actor;
		const target = gameData.findAlive(this.targetId);

		if (this._phase === Phase.WINDUP) {
			if (--this._timer > 0) return;
			this._phase = Phase.AIR;
			this._timer = this._scaled(this._airTicks);
			actor.getState(State.BASIC_ATTACK).startCooldown(this._airTicks); // attack cooldown covers the leap + recovery
			return;
		}

		if (this._phase === Phase.AIR) {
			if (!target || target.isDead || !actor.canAttack(target)) { // target vanished mid-air: nothing to land on, ability stays armed
				this._phase = Phase.RECOVERY;
				return;
			}
			if (--this._timer > 0) return;
			if (actor.hitTarget(target, this._damageMultiplier)) {
				actor.combatState.abilities[AbilityName.JUMPING_ATTACK].armed = false;
				this.cooldownTimer = this.maxCooldown;
			}
			this._phase = Phase.RECOVERY;
			return;
		}

		if (actor.isAttackOnCooldown) return; // recovery lasts until the attack cooldown is over
		actor.transition(Event.ATTACK_FINISHED, { targetId: this.targetId });
	}

	_scaled(ticks) {
		return Math.max(1, Math.round(ticks / this.actor.attackSpeed));
	}
}
