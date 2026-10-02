import { BaseState } from "./base/BaseState.js";
import { StateName }        from "./name/StateName.js";

export class DeadState extends BaseState {
	constructor(actor) {
		super(actor, StateName.DEAD);
	}
}
