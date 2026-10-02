export class RecoveryState {
	constructor() {
		this.name = "recovery";
	}

	enter() {}

	tick(basicAttack, actor) {
		if (basicAttack.recoveryTimer > 0) return;
		if (actor.combatState.states.prep) {
			actor.combatState.states.prep.enter();
			actor.combatState.state = "prep";
		} else {
			actor.combatState.state = "idle";
		}
	}

	processMoveRequest(basicAttack, actor, x, z) {
		if (basicAttack.recoveryTimer > 0) return;
		actor.combatState.states.moving.enter({ x, z });
		actor.combatState.state = "moving";
	}

	processAttackRequest() {}
}
