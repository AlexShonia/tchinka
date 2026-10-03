import { Entity } from "./Entity.js";
import { State }        from "../../gametick/transitions/types/State.js";
import { subState }     from "../../gametick/transitions/types/SubState.js";

export class Alive extends Entity {
	constructor() {
		super();
		this.moveSpeed         = 0;
		this.damage            = 0;
		this.attackSpeed       = 1;
		this.health            = 0;
		this.hit               = false;
		this.combatState = {
			state:       State.IDLE,
			states:      {},
			transitions: {},
		};
	}

	get currentState() {
		return this.combatState.states[this.combatState.state];
	}

	faceTowards(point) {
		if (!point) return;
		const dx = point.x - this.x;
		const dz = point.z - this.z;
		if (dx === 0 && dz === 0) return;
		this.facing = Math.atan2(dx, dz);
	}

	get isDead() {
		return this.combatState.state === State.DEAD;
	}

	get isAttackOnCooldown() {
		return this.getState(State.BASIC_ATTACK).recoveryTimer > 0;
	}

	getState(name) {
		return this.combatState.states[name];
	}

	changeState(name) {
		this.combatState.state = name;
	}

	// a state reports an event; this entity's transition map says where it leads (no entry = ignored); returns whether it moved
	// a row for the current substate (see SubState.js) wins over the state's row, even with a null target (= ignored)
	transition(event, context) {
		const { state, transitions } = this.combatState;
		const substate = this.currentState.substate;
		const specific = substate && transitions[subState(state, substate)];
		const next     = specific && event in specific ? specific[event] : transitions[state]?.[event];
		if (next === undefined || next === null) return false;
		this.getState(next).initialize(context);
		this.changeState(next);
		return true;
	}

	canAttack(target) {
		return false;
	}

	// damages the target if it is alive, attackable and within attackRange; returns whether it did
	hitTarget(target, multiplier = 1) {
		if (!target || target.isDead || !this.canAttack(target)) return false;
		if (Math.hypot(target.x - this.x, target.z - this.z) >= this.attackRange) return false;
		target.takeDamage(this.damage * multiplier);
		return true;
	}

	// an ability the entity armed that replaces its next normal attack; only entities with abilities have any
	get hasArmedAbility() {
		return false;
	}

	takeDamage(amount) {
		this.health -= amount;
		this.hit     = true;
		if (this.health > 0) return;
		this.health = 0;
		this.changeState(State.DEAD);
	}

}
