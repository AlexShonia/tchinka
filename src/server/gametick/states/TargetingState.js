export class TargetingState {
	constructor() {
		this.name          = "targeting";
		this.targetEnemyId = null;
	}

	enter(targetEnemyId) {
		this.targetEnemyId = targetEnemyId;
	}

	tick(actor, gameData) {
		const target = gameData.enemies.find(e => e.id === this.targetEnemyId);
		if (!target || target.hp <= 0) {
			actor.state = "idle";
			return;
		}

		const dist = Math.hypot(target.x - actor.x, target.z - actor.z);
		if (dist <= actor.attackRange) {
			actor.states.windup.enter(actor.attackSpeed);
			actor.state = "windup";
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
}
