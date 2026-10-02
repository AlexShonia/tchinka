export class IdleState {
	constructor() {
		this.name = "idle";
	}

	tick() {}

	processMoveRequest(actor, x, z) {
		actor.combatState.states.moving.enter({ x, z });
		actor.combatState.state = "moving";
	}

	processAttackRequest(actor, enemyId) {
		if (actor.attackCooldown > 0) return;
		actor.combatState.states.targeting.enter(enemyId);
		actor.combatState.state = "targeting";
	}

}
