export class WindupState {
	constructor(baseTicks) {
		this.name       = "windup";
		this._baseTicks = baseTicks;
		this._timer     = 0;
		this.start      = 0;
	}

	enter(attackSpeed = 1) {
		this._timer = Math.max(1, Math.round(this._baseTicks / attackSpeed));
		this.start  = Date.now();
	}

	tick(onExpire) {
		if (--this._timer <= 0) onExpire();
	}
}
