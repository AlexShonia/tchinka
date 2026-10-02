import { BaseState } from "./BaseState.js";

export class TargetingState extends BaseState {
	constructor(actor) {
		super();
		this.name          = "targeting";
		this.actor         = actor;
		this.targetEnemyId = null;
	}

	initialize(targetEnemyId) {
		this.targetEnemyId = targetEnemyId;
	}

	initializeAndChangeTo(targetEnemyId) {
		this.initialize(targetEnemyId);
		this.actor.combatState.state = this.name;
	}

	tick(gameData) {
		const target = gameData.enemies.find(e => e.id === this.targetEnemyId);
		if (!target || target.health <= 0) {
			this.actor.combatState.state = "idle";
			return;
		}

		const dist = Math.hypot(target.x - this.actor.x, target.z - this.actor.z);
		if (dist <= this.actor.attackRange && this.actor.combatState.states.basicAttack.recoveryTimer <= 0) {
			this.actor.combatState.states.basicAttack.initializeAndChangeTo(this.actor.attackSpeed, this.targetEnemyId);
			return;
		}

		const angle = Math.atan2(target.z - this.actor.z, target.x - this.actor.x);
		const destX = target.x - Math.cos(angle) * (this.actor.attackRange * 0.8);
		const destZ = target.z - Math.sin(angle) * (this.actor.attackRange * 0.8);
		const dx    = destX - this.actor.x;
		const dz    = destZ - this.actor.z;
		const d     = Math.hypot(dx, dz);
		if (d > this.actor.moveSpeed) {
			this.actor.x += (dx / d) * this.actor.moveSpeed;
			this.actor.z += (dz / d) * this.actor.moveSpeed;
		} else {
			this.actor.x = destX;
			this.actor.z = destZ;
		}
	}

	processMoveRequest(x, z) {
		this.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}

	processAttackRequest(targetEnemyId) {
		this.initialize(targetEnemyId);
	}
}
