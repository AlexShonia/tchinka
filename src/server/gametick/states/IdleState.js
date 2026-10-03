import { BaseState } from "./base/BaseState.js";
import { State }     from "../transitions/types/State.js";

// Waits. Leaves only through an Event (see the actor's transition map).
export class IdleState extends BaseState {
	constructor(actor) {
		super(actor, State.IDLE);
	}
}
