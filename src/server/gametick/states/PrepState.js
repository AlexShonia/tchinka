export class PrepState {
	constructor(baseTicks) {
		this.name       = "prep";
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	enter() {
		this._timer = this._baseTicks;
	}

	tick(actor, _gameData, nearest) {
		const destX = nearest.x + Math.cos(actor.offsetAngle) * actor.attackRange;
		const destZ = nearest.z + Math.sin(actor.offsetAngle) * actor.attackRange;
		const dist  = Math.hypot(destX - actor.x, destZ - actor.z);

		if (dist > 0.3) {
			actor.combatState.state = "idle";
			actor.offsetAngle       = Math.random() * Math.PI * 2;
			return;
		}

		if (--this._timer > 0) return;
		actor.combatState.states.basicAttack.enter(actor.attackSpeed);
		actor.combatState.state = "basicAttack";
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
