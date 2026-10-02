import { BaseState }  from "./base/BaseState.js";
import { StateName }  from "./name/StateName.js";
import { StateEvent } from "./name/StateEvent.js";

export class IdleState extends BaseState {
	constructor(actor) {
		super(actor, StateName.IDLE);
	}

	tick(gameData) {
		const target = this.actor.findTarget(gameData);
		if (target) this.actor.transition(StateEvent.TARGET_FOUND, { targetId: target.id });
	}
}
