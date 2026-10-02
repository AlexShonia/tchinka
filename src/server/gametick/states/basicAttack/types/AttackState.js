import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../../../../shared/combatConfig.js";

export class AttackState {
	constructor(basicAttack) {
		this.name        = "hit";
		this.basicAttack = basicAttack;
		this._timer      = 0;
	}

	initialize(gameData) {
		const basicAttack = this.basicAttack;
		this._timer = Math.max(1, Math.round(basicAttack.hitTicks / basicAttack.attackSpeed));
		const actor = basicAttack.actor;
		if (actor.combatState.states.targeting) this._damageTargetEnemy(actor, gameData, basicAttack.targetEnemyId);
		else                                     this._damageTargetPlayer(actor, gameData, basicAttack.targetEnemyId);
	}

	tick(gameData) {
		if (--this._timer > 0) return;
		const basicAttack = this.basicAttack;
		basicAttack._current = basicAttack._recovery;
	}

	_damageTargetEnemy(actor, gameData, targetEnemyId) {
		const target = gameData.enemies.find(e => e.id === targetEnemyId);
		if (!target || Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;

		target.health -= PLAYER_COMBAT.damage;
		if (target.health > 0) return;

		const idx = gameData.enemies.indexOf(target);
		if (idx !== -1) gameData.enemies.splice(idx, 1);
		actor.combatState.states.targeting.targetEnemyId = null;
	}

	_damageTargetPlayer(actor, gameData, targetPlayerId) {
		const target = [...gameData.players.values()].find(p => p.id === targetPlayerId);
		if (!target || target.combatState.state === "dead") return;
		if (Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;

		target.health -= ENEMY_COMBAT.damage;
		target.hit     = true;
		if (target.health > 0) return;

		target.health            = 0;
		target.changeState("dead");
	}
}
