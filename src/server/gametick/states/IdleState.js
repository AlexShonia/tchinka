import { BaseState } from "./base/BaseState.js";

export class IdleState extends BaseState {
	constructor(actor) {
		super(actor, "idle");
	}

	processMoveRequest(x, z) {
		this.actor.combatState.states.moving.initialize({ x, z });
		this.actor.changeState("moving");
	}

	processAttackRequest(targetEnemyId) {
		this.actor.combatState.states.targeting.initialize(targetEnemyId);
		this.actor.changeState("targeting");
	}
}
