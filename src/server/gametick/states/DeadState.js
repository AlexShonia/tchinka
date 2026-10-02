import { BaseState } from "./base/BaseState.js";

export class DeadState extends BaseState {
	constructor(actor) {
		super(actor, "dead");
	}
}
