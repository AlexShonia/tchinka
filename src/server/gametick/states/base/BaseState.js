//Architectural Decision: passive tick only updates state specific data, not including gameData or actor, mostly used for cooldowns
export class BaseState {
	constructor(actor, name) {
		this.actor = actor;
		this.name  = name;
	}

	initialize(context) {}
	passiveTick() {}
	tick(gameData) {}
}
