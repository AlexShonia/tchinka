export class AttackState {
	constructor(ticks) {
		this.name   = "attack";
		this._ticks = ticks;
	}

	tick(entity, onExpire) {
		if (--entity.attackTimer <= 0) onExpire(entity);
	}

	enter(entity) {
		entity.attackTimer = this._ticks;
	}
}
