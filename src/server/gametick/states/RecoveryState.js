export class RecoveryState {
	constructor(baseTicks) {
		this.name       = "recovery";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	enter(attackSpeed = 1) {
		this._timer = Math.max(1, Math.round(this._baseTicks / attackSpeed));
	}

	tick(actor) {
		if (--this._timer > 0) return;

		if (actor.states.cooldown) {
			actor.states.cooldown.enter(actor.attackSpeed);
			actor.state = "cooldown";
		} else {
			actor.states.prep.enter();
			actor.state = "prep";
		}
	}
}
