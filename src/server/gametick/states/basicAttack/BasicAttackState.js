import { BaseState }    from "../base/BaseState.js";
import { WindupState }   from "./types/WindupState.js";
import { AttackState }   from "./types/AttackState.js";
import { RecoveryState } from "./types/RecoveryState.js";
import { StateName }        from "../name/StateName.js";

export class BasicAttackState extends BaseState {
	constructor(actor, windupTicks, hitTicks, recoveryTicks) {
		super(actor, StateName.BASIC_ATTACK);
		this.windupTicks   = windupTicks;
		this.hitTicks      = hitTicks;
		this.recoveryTicks = recoveryTicks;
		this.attackSpeed   = 1;
		this.targetId = null;

		this._windup   = new WindupState(this);
		this._attack   = new AttackState(this);
		this._recovery = new RecoveryState(this);
		this._current  = this._windup;
	}

	initialize(attackSpeed = 1, targetId) {
		this.attackSpeed   = attackSpeed;
		this.targetId = targetId;
		if (this._recovery.recoveryTimer > 0) {
			this._current = this._recovery;
		} else {
			this._current = this._windup;
			this._current.initialize();
		}
	}

	tick(gameData) {
		this._current.tick(gameData);
	}

	processMoveRequest(x, z) {
		this.actor.getState(StateName.MOVING).initialize({ x, z });
		this.actor.changeState(StateName.MOVING);
	}

	passiveTick() {
		if (this._recovery.recoveryTimer > 0) this._recovery.recoveryTimer--;
	}

	get subStateName()  { return this._current.name; }
	get recoveryTimer() { return this._recovery.recoveryTimer; }

}
