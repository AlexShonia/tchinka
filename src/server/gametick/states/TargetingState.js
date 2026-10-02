export class TargetingState {
	constructor() {
		this.name          = "targeting";
		this.targetEnemyId = null;
	}

	initialize(targetEnemyId) {
		this.targetEnemyId = targetEnemyId;
	}

	initializeAndChangeTo(actor, targetEnemyId) {
		this.initialize(targetEnemyId);
		actor.combatState.state = this.name;
	}

	tick(actor, gameData) {
		const target = gameData.enemies.find(e => e.id === this.targetEnemyId);
		if (!target || target.health <= 0) {
			actor.combatState.state = "idle";
			return;
		}

		const dist = Math.hypot(target.x - actor.x, target.z - actor.z);
		if (dist <= actor.attackRange && actor.combatState.states.basicAttack.recoveryTimer <= 0) {
			actor.combatState.states.basicAttack.initializeAndChangeTo(actor, actor.attackSpeed, this.targetEnemyId);
			return;
		}

		const angle = Math.atan2(target.z - actor.z, target.x - actor.x);
		const destX = target.x - Math.cos(angle) * (actor.attackRange * 0.8);
		const destZ = target.z - Math.sin(angle) * (actor.attackRange * 0.8);
		const dx    = destX - actor.x;
		const dz    = destZ - actor.z;
		const d     = Math.hypot(dx, dz);
		if (d > actor.moveSpeed) {
			actor.x += (dx / d) * actor.moveSpeed;
			actor.z += (dz / d) * actor.moveSpeed;
		} else {
			actor.x = destX;
			actor.z = destZ;
		}
	}

	processMoveRequest(actor, x, z) {
		actor.combatState.states.moving.initializeAndChangeTo(actor, { x, z });
	}

	processAttackRequest(_actor, enemyId) {
		this.initialize(enemyId);
	}
}
