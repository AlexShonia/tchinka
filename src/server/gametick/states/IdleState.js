import { BaseState } from "./base/BaseState.js";

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
		this.actor.combatState.states.targeting.initializeAndChangeTo(targetEnemyId);
	}
}
