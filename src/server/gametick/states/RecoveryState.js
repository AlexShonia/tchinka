export class RecoveryState {
	constructor(ticks) {
		this.name   = "recovery";
		this._ticks = ticks;
	}

	tick(entity, onExpire) {
		if (--entity.attackTimer <= 0) onExpire(entity);
	}

	enter(entity) {
		entity.attackTimer = this._ticks;
	}
}
