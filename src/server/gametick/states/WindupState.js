import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../../shared/combatConfig.js";

export class WindupState {
	constructor(baseTicks) {
		this.name       = "windup";
		this._baseTicks = baseTicks;
		this._timer     = 0;
		this.start      = 0;
	}

	enter(attackSpeed = 1) {
		this._timer = Math.max(1, Math.round(this._baseTicks / attackSpeed));
		this.start  = Date.now();
	}

	tick(actor, gameData, nearest) {
		if (--this._timer > 0) return;

		actor.states.attack.enter(actor.attackSpeed);
		actor.state = "attack";

		if (actor.states.targeting) this._damageTarget(actor, gameData);
		else this._damageNearest(actor, nearest);
	}

	_damageTarget(actor, gameData) {
		const target = gameData.enemies.find(e => e.id === actor.states.targeting.targetEnemyId);
		if (!target || Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;

		target.hp -= PLAYER_COMBAT.damage;
		if (target.hp > 0) return;

		const idx = gameData.enemies.indexOf(target);
		if (idx !== -1) gameData.enemies.splice(idx, 1);
		actor.states.targeting.targetEnemyId = null;
	}

	_damageNearest(actor, nearest) {
		if (!nearest || Math.hypot(nearest.x - actor.x, nearest.z - actor.z) >= actor.attackRange) return;

		nearest.health -= ENEMY_COMBAT.damage;
		nearest.hit = true;
		if (nearest.health > 0) return;

		nearest.health = 0;
		nearest.dead   = true;
		nearest.state  = "idle";
	}
}
