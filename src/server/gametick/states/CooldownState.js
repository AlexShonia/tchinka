export class CooldownState {
	constructor(baseTicks) {
		this.name       = "cooldown";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	enter(attackSpeed = 1) {
		this._timer = Math.round(this._baseTicks / attackSpeed);
	}

	tick(actor) {
		if (--this._timer <= 0) actor.state = "idle";
	}
}
