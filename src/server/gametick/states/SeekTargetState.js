import { BaseState }     from "./base/BaseState.js";
import { State }         from "../transitions/types/State.js";
import { Event }         from "../transitions/types/Event.js";
import { nearestTarget } from "../../utils/nearest.js";

// Looks for the nearest thing the actor can attack.
export class SeekTargetState extends BaseState {
	constructor(actor) {
		super(actor, State.SEEK_TARGET);
	}

	tick(gameData) {
		const target = nearestTarget(this.actor, gameData);
		if (target) this.actor.transition(Event.TARGET_FOUND, { targetId: target.id });
	}
}
