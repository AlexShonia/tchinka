import { BaseState }  from "./base/BaseState.js";
import { State }  from "../transitions/types/State.js";
import { Event } from "../transitions/types/Event.js";

export class IdleState extends BaseState {
	constructor(actor) {
		super(actor, State.IDLE);
	}

	tick(gameData) {
		const target = this.actor.findTarget(gameData);
		if (target) this.actor.transition(Event.TARGET_FOUND, { targetId: target.id });
	}
}
