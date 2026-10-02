export class IdleState {
	constructor(actor) {
		this.name  = "idle";
		this.actor = actor;
	}

	tick() {}

	processMoveRequest(x, z) {
		this.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}

	processAttackRequest(enemyId) {
		if (this.actor.attackCooldown > 0) return;
		this.actor.combatState.states.targeting.initializeAndChangeTo(enemyId);
	}
}
