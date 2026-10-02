import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../../../../shared/combatConfig.js";
import { nearestPlayer } from "../../../../utils/nearest.js";

export class AttackState {
	constructor() {
		this.name   = "hit";
		this._timer = 0;
	}

	initialize(basicAttack, gameData) {
		this._timer = Math.max(1, Math.round(basicAttack.hitTicks / basicAttack.attackSpeed));
		const actor = basicAttack.actor;
		if (actor.combatState.states.targeting) this._damageTarget(actor, gameData, basicAttack.targetEnemyId);
		else this._damageNearest(actor, gameData);
	}

	tick(basicAttack, gameData) {
		if (--this._timer > 0) return;
		basicAttack._transition("recovery", gameData);
	}

	_damageTarget(actor, gameData, targetEnemyId) {
		const target = gameData.enemies.find(e => e.id === targetEnemyId);
		if (!target || Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;

		target.health -= PLAYER_COMBAT.damage;
		if (target.health > 0) return;

		const idx = gameData.enemies.indexOf(target);
		if (idx !== -1) gameData.enemies.splice(idx, 1);
		actor.combatState.states.targeting.targetEnemyId = null;
	}

	_damageNearest(actor, gameData) {
		const nearest = nearestPlayer(actor, gameData);
		if (!nearest || Math.hypot(nearest.x - actor.x, nearest.z - actor.z) >= actor.attackRange) return;

		nearest.health -= ENEMY_COMBAT.damage;
		nearest.hit = true;
		if (nearest.health > 0) return;

		nearest.health            = 0;
		nearest.combatState.state = "dead";
	}

	processMoveRequest(basicAttack, x, z) {
		basicAttack.actor.combatState.states.moving.initializeAndChangeTo({ x, z });
	}
	processAttackRequest() {}
}
