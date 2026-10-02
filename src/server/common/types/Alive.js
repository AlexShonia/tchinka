import { Entity } from "./Entity.js";
import { StateName }        from "../../gametick/states/name/StateName.js";

export class Alive extends Entity {
	constructor() {
		super();
		this.moveSpeed         = 0;
		this.damage            = 0;
		this.attackSpeed       = 1;
		this.health            = 0;
		this.hit               = false;
		this.combatState = {
			state:  StateName.IDLE,
			states: {},
		};
	}

	get currentState() {
		return this.combatState.states[this.combatState.state];
	}

	get isDead() {
		return this.combatState.state === StateName.DEAD;
	}

	getState(name) {
		return this.combatState.states[name];
	}

	changeState(name) {
		this.combatState.state = name;
	}

	canAttack(target) {
		return false;
	}

	// what to do each tick while idle (players wait for requests, so nothing by default)
	onIdle(gameData) {}

	// what to do once an attack (windup, hit, recovery) is over; entities override this
	onAttackFinished(targetId) {
		this.changeState(StateName.IDLE);
	}

	takeDamage(amount) {
		this.health -= amount;
		this.hit     = true;
		if (this.health > 0) return;
		this.health = 0;
		this.changeState(StateName.DEAD);
	}

}
