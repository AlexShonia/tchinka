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
			state:       StateName.IDLE,
			states:      {},
			transitions: {},
		};
	}

	get currentState() {
		return this.combatState.states[this.combatState.state];
	}

	get isDead() {
		return this.combatState.state === StateName.DEAD;
	}

	get isAttackOnCooldown() {
		return this.getState(StateName.RECOVERY).recoveryTimer > 0;
	}

	getState(name) {
		return this.combatState.states[name];
	}

	changeState(name) {
		this.combatState.state = name;
	}

	// a state reports an event; this entity's transition map says where it leads (no entry = ignored)
	transition(event, context) {
		const next = this.combatState.transitions[this.combatState.state]?.[event];
		if (next === undefined) return;
		this.getState(next).initialize(context);
		this.changeState(next);
	}

	canAttack(target) {
		return false;
	}

	// who to go after while idle; players wait for requests, so nobody by default
	findTarget(gameData) {
		return null;
	}

	takeDamage(amount) {
		this.health -= amount;
		this.hit     = true;
		if (this.health > 0) return;
		this.health = 0;
		this.changeState(StateName.DEAD);
	}

}
