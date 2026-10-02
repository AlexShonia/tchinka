export class AttackState {
	constructor(baseTicks) {
		this.name       = "attack";
		this._baseTicks = baseTicks;
	}

	enter(entity) {
		entity.attackTimer = Math.max(1, Math.round(this._baseTicks / (entity.attackSpeed ?? 1)));
	}

	tick(entity, onExpire) {
		if (--entity.attackTimer <= 0) onExpire(entity);
	}
}
