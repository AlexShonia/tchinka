import { Entity } from "./Entity.js";

export class Alive extends Entity {
	constructor() {
		super();
		this.moveSpeed         = 0;
		this.damage            = 0;
		this.attackSpeed       = 1;
		this.health            = 0;
		this.hit               = false;
		this.combatState = {
			state:  "idle",
			states: {},
		};
	}

	get currentState() {
		return this.combatState.states[this.combatState.state];
	}

}
