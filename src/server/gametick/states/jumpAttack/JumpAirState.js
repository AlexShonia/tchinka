import { BaseState }   from "../base/BaseState.js";
import { StateName }   from "../name/StateName.js";
import { StateEvent }  from "../name/StateEvent.js";
import { AbilityName } from "../name/AbilityName.js";

// The leap, straight up and down for now (no x/z movement). Not cancellable (no MOVE_REQUESTED row in the map). The ability is only spent if the landing actually damages someone.
export class JumpAirState extends BaseState {
	constructor(actor, airTicks, damageMultiplier, cooldownTicks) {
		super(actor, StateName.JUMP_AIR);
		this._airTicks         = airTicks;
		this._damageMultiplier = damageMultiplier;
		this._timer            = 0;
		this.targetId          = null;
		this.maxCooldown       = cooldownTicks;
		this.cooldownTimer     = 0; // the ability's own cooldown, separate from the attack cooldown on RecoveryState
	}

	passiveTick() {
		if (this.cooldownTimer > 0) this.cooldownTimer--;
	}

	initialize({ targetId }) {
		this.targetId = targetId;
		this._timer   = Math.max(1, Math.round(this._airTicks / this.actor.attackSpeed));
		this.actor.getState(StateName.RECOVERY).startCooldown(this._airTicks); // attack cooldown covers the leap + recovery
	}

	tick(gameData) {
		const actor  = this.actor;
		const target = gameData.findAlive(this.targetId);
		if (!target || target.isDead || !actor.canAttack(target)) { // target vanished mid-air: nothing to land on, ability stays armed
			actor.transition(StateEvent.HIT_FINISHED, { targetId: this.targetId });
			return;
		}

		actor.faceTowards(target);
		if (--this._timer > 0) return;
		if (actor.hitTarget(target, this._damageMultiplier)) {
			actor.combatState.abilities[AbilityName.JUMPING_ATTACK].armed = false;
			this.cooldownTimer = this.maxCooldown;
		}
		actor.transition(StateEvent.HIT_FINISHED, { targetId: this.targetId });
	}
}
