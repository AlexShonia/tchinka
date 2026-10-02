export class AttackState {
	constructor(baseTicks) {
		this.name       = "attack";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	enter(attackSpeed = 1) {
		this._timer = Math.max(1, Math.round(this._baseTicks / attackSpeed));
	}

	tick(onExpire) {
		if (--this._timer <= 0) onExpire();
	}
}
