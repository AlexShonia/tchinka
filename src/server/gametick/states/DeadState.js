import { BaseState } from "./base/BaseState.js";
import { State }        from "../transitions/types/State.js";

export class DeadState extends BaseState {
	constructor(actor) {
		super(actor, State.DEAD);
	}
}
