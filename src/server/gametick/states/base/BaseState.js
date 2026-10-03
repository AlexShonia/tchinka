//Architectural Decision: passive tick only updates state specific data, not including gameData or actor, mostly used for cooldowns
export class BaseState {
	constructor(actor, name) {
		this.actor = actor;
		this.name  = name;
	}

	// what the client is told we are doing; attack states report idle while they only wait out a cooldown
	get visualState() {
		return this.name;
	}

	// phase inside this state, for transition rows keyed by subState(state, phase); null = no phases
	get substate() {
		return null;
	}

	initialize(context) {}
	passiveTick() {}
	tick(gameData) {}
}
