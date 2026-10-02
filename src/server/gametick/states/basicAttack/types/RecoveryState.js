import { StateName }        from "../../name/StateName.js";

export class RecoveryState {
	constructor(basicAttack) {
		this.name          = StateName.RECOVERY;
		this.basicAttack   = basicAttack;
		this.recoveryTimer = 0;
	}

	// called when the hit begins, not when recovery begins: the countdown covers hit + recovery and keeps running in passiveTick
	initialize() {
		const basicAttack  = this.basicAttack;
		this.recoveryTimer = Math.max(1, Math.round((basicAttack.hitTicks + basicAttack.recoveryTicks) / basicAttack.attackSpeed));
	}

	tick(gameData) {
		if (this.recoveryTimer > 0) return; // counted down in BasicAttackState.passiveTick
		const basicAttack = this.basicAttack;
		basicAttack.actor.onAttackFinished(basicAttack.targetId);
	}
}
