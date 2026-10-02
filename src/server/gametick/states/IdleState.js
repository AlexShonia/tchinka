import { BaseState } from "./BaseState.js";

export class IdleState extends BaseState {
	constructor(actor) {
		super();
		this.name  = "idle";
		this.actor = actor;
	}

	processMoveRequest(x, z) {
		this.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}

	processAttackRequest(targetEnemyId) {
		if (this.actor.attackCooldown > 0) return;
		this.actor.combatState.states.targeting.initializeAndChangeTo(targetEnemyId);
	}
}
