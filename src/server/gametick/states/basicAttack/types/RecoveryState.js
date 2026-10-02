export class RecoveryState {
	constructor(basicAttack) {
		this.name          = "recovery";
		this.basicAttack   = basicAttack;
		this.recoveryTimer = 0;
	}

	// called when the hit begins, not when recovery begins: the countdown covers hit + recovery and keeps running in passiveTick
	initialize() {
		const basicAttack  = this.basicAttack;
		this.recoveryTimer = Math.max(1, Math.round((basicAttack.hitTicks + basicAttack.recoveryTicks) / basicAttack.attackSpeed));
	}

	tick(gameData) {
		if (this.recoveryTimer > 0) { this.recoveryTimer--; return; }
		const actor = this.basicAttack.actor;
		if (actor.combatState.states.prep) {
			actor.combatState.states.prep.initialize();
			actor.changeState("prep");
		} else {
			actor.changeState("idle");
		}
	}
}
