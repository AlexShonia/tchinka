export class WindupState {
	constructor(baseTicks) {
		this.name       = "windup";
		this._baseTicks = baseTicks;
	}

	enter(entity) {
		entity.attackTimer = Math.max(1, Math.round(this._baseTicks / (entity.attackSpeed ?? 1)));
		entity.attackStart = Date.now();
	}

	tick(entity, onExpire) {
		if (--entity.attackTimer <= 0) onExpire(entity);
	}
}
