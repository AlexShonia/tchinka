import { WindupState }   from "./types/WindupState.js";
import { AttackState }      from "./types/AttackState.js";
import { RecoveryState } from "./types/RecoveryState.js";

export class BasicAttackState {
	constructor(windupTicks, hitTicks, recoveryTicks) {
		this.name          = "basicAttack";
		this.windupTicks   = windupTicks;
		this.hitTicks      = hitTicks;
		this.recoveryTicks = recoveryTicks;
		this.attackSpeed   = 1;
		this.recoveryTimer = 0;

		this._windup   = new WindupState();
		this._attack      = new AttackState();
		this._recovery = new RecoveryState();
		this._current  = this._windup;
	}

	get subStateName() { return this._current.name; }

	enter(attackSpeed = 1) {
		this.attackSpeed = attackSpeed;
		this._transition("windup");
	}

	_transition(name, actor, gameData, nearest) {
		const map = { windup: this._windup, attack: this._attack, recovery: this._recovery };
		this._current = this._windup;
		this._current.enter(this, actor, gameData, nearest);
	}

	tick(actor, gameData, nearest) {
		if (this.recoveryTimer > 0) this.recoveryTimer--;
		this._current.tick(this, actor, gameData, nearest);
	}

	processMoveRequest(actor, x, z) {
		this._current.processMoveRequest(this, actor, x, z);
	}

	processAttackRequest() {}
}
