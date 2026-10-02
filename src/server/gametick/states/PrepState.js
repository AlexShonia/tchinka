import { BaseState }    from "./BaseState.js";
import { nearestPlayer } from "../../utils/nearest.js";

export class PrepState extends BaseState {
	constructor(actor, baseTicks) {
		super();
		this.name       = "prep";
		this.actor      = actor;
		this._baseTicks = baseTicks;
		this._timer     = 0;
	}

	initialize() {
		this._timer = this._baseTicks;
	}

	initializeAndChangeTo() {
		this.initialize();
		this.actor.combatState.state = this.name;
	}

	tick(gameData) {
		const nearest = nearestPlayer(this.actor, gameData);
		if (!nearest) { this.actor.combatState.state = "idle"; return; }

		const destX = nearest.x + Math.cos(this.actor.offsetAngle) * this.actor.attackRange;
		const destZ = nearest.z + Math.sin(this.actor.offsetAngle) * this.actor.attackRange;
		const dist  = Math.hypot(destX - this.actor.x, destZ - this.actor.z);

		if (dist > 0.3) {
			this.actor.combatState.state = "idle";
			this.actor.offsetAngle       = Math.random() * Math.PI * 2;
			return;
		}

		if (--this._timer > 0) return;
		this.actor.combatState.states.basicAttack.initializeAndChangeTo(this.actor.attackSpeed);
	}
}
