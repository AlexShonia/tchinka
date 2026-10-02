import { BaseState }    from "./base/BaseState.js";
import { nearestPlayer } from "../../utils/nearest.js";

export class ChaseNearestPlayerState extends BaseState {
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

	tick(gameData) { //TODO this chace logic runs on every tick maybe weird
		const nearest = nearestPlayer(this.actor, gameData);
		if (!nearest) return;

		const destX = nearest.x + Math.cos(this.actor.offsetAngle) * this.actor.attackRange;
		const destZ = nearest.z + Math.sin(this.actor.offsetAngle) * this.actor.attackRange;
		const dist  = Math.hypot(destX - this.actor.x, destZ - this.actor.z);

		if (dist > 0.08) {
			this.actor.x    += ((destX - this.actor.x) / dist) * this.actor.speed;
			this.actor.z    += ((destZ - this.actor.z) / dist) * this.actor.speed;
			this._timer      = this._baseTicks;
			return;
		}

		if (--this._timer > 0) return;
		this.actor.combatState.states.basicAttack.initializeAndChangeTo(this.actor.attackSpeed, nearest.id);
	}
}
