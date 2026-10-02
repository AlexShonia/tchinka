export class IdleState {
	constructor() {
		this.name = "idle";
	}

	tick() {}

	processMoveRequest(actor, x, z) {
		actor.combatState.states.moving.initializeAndChangeTo(actor, { x, z });
	}

	processAttackRequest(actor, enemyId) {
		if (actor.attackCooldown > 0) return;
		actor.combatState.states.targeting.initializeAndChangeTo(actor, enemyId);
	}
}
