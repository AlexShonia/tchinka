import { BaseState } from "./base/BaseState.js";
import { StateName }        from "./name/StateName.js";

export class IdleState extends BaseState {
	constructor(actor) {
		super(actor, StateName.IDLE);
	}

	tick(gameData) {
		this.actor.onIdle(gameData);
	}

	processMoveRequest(x, z) {
		this.actor.getState(StateName.MOVING).initialize({ x, z });
		this.actor.changeState(StateName.MOVING);
	}

	processAttackRequest(targetId) {
		this.actor.getState(StateName.TARGETING).initialize(targetId);
		this.actor.changeState(StateName.TARGETING);
	}
}
