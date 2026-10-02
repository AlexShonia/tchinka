export class PrepState {
	constructor(baseTicks) {
		this.name       = "prep";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	enter() {
		this._timer = this._baseTicks;
	}

	tick(onExpire) {
		if (--this._timer <= 0) onExpire();
	}
}
