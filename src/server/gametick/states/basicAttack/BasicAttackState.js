import { BaseState }    from "../base/BaseState.js";
import { WindupState }   from "./types/WindupState.js";
import { AttackState }   from "./types/AttackState.js";
import { RecoveryState } from "./types/RecoveryState.js";

export class BasicAttackState extends BaseState {
	constructor(actor, windupTicks, hitTicks, recoveryTicks) {
		super();
		this.name          = "basicAttack";
		this.actor         = actor;
		this.windupTicks   = windupTicks;
		this.hitTicks      = hitTicks;
		this.recoveryTicks = recoveryTicks;
		this.attackSpeed   = 1;
		this.targetEnemyId = null;

		this._windup   = new WindupState();
		this._attack   = new AttackState();
		this._recovery = new RecoveryState();
		this._current  = this._windup;
	}

	get subStateName()  { return this._current.name; }
	get recoveryTimer() { return this._recovery.recoveryTimer; }

	passiveTick() {
		if (this._recovery.recoveryTimer > 0) this._recovery.recoveryTimer--;
	}

	initialize(attackSpeed = 1, targetEnemyId) {
		this.attackSpeed   = attackSpeed;
		this.targetEnemyId = targetEnemyId;
		if(this.recoveryTimer > 0)
			this._recovery.initializeAndChangeTo(this.actor) //TODO this is retarded why is superclass telling sublcass that that subclass should change state of superclass pff  this should be just every state has emthod changetoAnditialize it take some other state and also calls initialize after hcanging to it
		this._current      = this._windup;
		this._current.initialize(this);
	}

	initializeAndChangeTo(attackSpeed = 1, targetEnemyId) {
		this.initialize(attackSpeed, targetEnemyId);
		this.actor.combatState.state = this.name;
	}

	_transition(name, gameData) {
		const map     = { windup: this._windup, attack: this._attack, recovery: this._recovery };
		this._current = map[name];
		this._current.initialize(this, gameData);
	}

	tick(gameData) {
		if (this._recovery.recoveryTimer > 0) this._current = this._recovery;
		this._current.tick(this, gameData);
	}

	processMoveRequest(x, z) {
		this._current.processMoveRequest(this, x, z);
	}
}
