export class RecoveryState {
	constructor() {
		this.name          = "recovery";
		this.recoveryTimer = 0;
	}

	initialize() {}

	tick(basicAttack, actor, gameData) {
		if (this.recoveryTimer > 0) { this.recoveryTimer--; return; }
		if (actor.combatState.states.prep) {
			actor.combatState.states.prep.initializeAndChangeTo(actor);
		} else {
			actor.combatState.state = "idle";
		}
	}

	processMoveRequest(basicAttack, actor, x, z) {
		if (this.recoveryTimer > 0) return;
		actor.combatState.states.moving.initializeAndChangeTo(actor, { x, z });
	}

	processAttackRequest() {}
}
