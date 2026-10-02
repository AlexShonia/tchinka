import { BaseState } from "./BaseState.js";

export class DeadState extends BaseState {
	constructor(actor) {
		super();
		this.name  = "dead";
		this.actor = actor;
	}
}
