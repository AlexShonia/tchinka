export class RecoveryState {
	constructor() {
		this.name          = "recovery";
		this.recoveryTimer = 0;
	}

	initialize() {}

	initializeAndChangeTo(actor) {
		actor.combatState.state = this;
	}

	tick(basicAttack, gameData) {
		if (this.recoveryTimer > 0) { this.recoveryTimer--; return; }
		const actor = basicAttack.actor;
		if (actor.combatState.states.prep) {
			actor.combatState.states.prep.initializeAndChangeTo();
		} else {
			actor.combatState.state = "idle";
		}
	}

	processMoveRequest(basicAttack, x, z) {
		basicAttack.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}

	processAttackRequest() {}
}
