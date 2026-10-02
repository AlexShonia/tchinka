export class WindupState {
	constructor(ticks) {
		this.name  = "windup";
		this._ticks = ticks;
	}

	tick(entity, onExpire) {
		if (--entity.attackTimer <= 0) onExpire(entity);
	}

	enter(entity) {
		entity.attackTimer = this._ticks;
		entity.attackStart = Date.now();
	}
}
