export class WindupState {
	constructor() {
		this.name   = "windup";
		this._timer = 0;
	}

	initialize(basicAttack) {
		this._timer = Math.max(1, Math.round(basicAttack.windupTicks / basicAttack.attackSpeed));
	}

	tick(basicAttack, gameData) {
		if (--this._timer > 0) return;
		basicAttack._recovery.recoveryTimer = Math.max(1, Math.round(
			(basicAttack.hitTicks + basicAttack.recoveryTicks) / basicAttack.attackSpeed
		));
		basicAttack._transition("attack", gameData);
	}

	processMoveRequest(basicAttack, x, z) {
		basicAttack.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}
	processAttackRequest() {}
}
