export class DeadState {
	constructor(actor) {
		this.name  = "dead";
		this.actor = actor;
	}

	tick() {}

	processMoveRequest() {}
	processAttackRequest() {}
}
