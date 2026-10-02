export class WindupState {
	constructor() {
		this.name   = "windup";
		this._timer = 0;
	}

	enter(basicAttack) {
		this._timer = Math.max(1, Math.round(basicAttack.windupTicks / basicAttack.attackSpeed));
	}

	tick(basicAttack, actor, gameData, nearest) {
		if (--this._timer > 0) return;
		// pre-pay the remaining commitment so RecoveryState and processMoveRequest can check it
		basicAttack.recoveryTimer = Math.max(1, Math.round(
			(basicAttack.hitTicks + basicAttack.recoveryTicks) / basicAttack.attackSpeed
		));
		basicAttack._transition("attack", actor, gameData, nearest);
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
