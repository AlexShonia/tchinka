import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../../../../shared/combatConfig.js";

export class AttackState {
	constructor() {
		this.name   = "hit";
		this._timer = 0;
	}

	enter(basicAttack, actor, gameData, nearest) {
		this._timer = Math.max(1, Math.round(basicAttack.hitTicks / basicAttack.attackSpeed));
		if (actor.combatState.states.targeting) this._damageTarget(actor, gameData);
		else this._damageNearest(actor, nearest);
	}

	tick(basicAttack, actor) {
		if (--this._timer > 0) return;
		basicAttack._transition("recovery");
	}

	_damageTarget(actor, gameData) {
		const targeting = actor.combatState.states.targeting;
		const target    = gameData.enemies.find(e => e.id === targeting.targetEnemyId);
		if (!target || Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;

		target.health -= PLAYER_COMBAT.damage;
		if (target.health > 0) return;

		const idx = gameData.enemies.indexOf(target);
		if (idx !== -1) gameData.enemies.splice(idx, 1);
		targeting.targetEnemyId = null;
	}

	_damageNearest(actor, nearest) {
		if (!nearest || Math.hypot(nearest.x - actor.x, nearest.z - actor.z) >= actor.attackRange) return;

		nearest.health -= ENEMY_COMBAT.damage;
		nearest.hit = true;
		if (nearest.health > 0) return;

		nearest.health            = 0;
		nearest.combatState.state = "dead";
	}

	processMoveRequest() {}
	processAttackRequest() {}
}
