import { StateName }        from "../../name/StateName.js";

export class AttackState {
	constructor(basicAttack) {
		this.name        = StateName.HIT;
		this.basicAttack = basicAttack;
		this._timer      = 0;
	}

	initialize(gameData) {
		const basicAttack = this.basicAttack;
		this._timer = Math.max(1, Math.round(basicAttack.hitTicks / basicAttack.attackSpeed));
		this._damageTarget(gameData);
	}

	tick(gameData) {
		if (--this._timer > 0) return;
		const basicAttack = this.basicAttack;
		basicAttack._current = basicAttack._recovery;
	}

	_damageTarget(gameData) {
		const basicAttack = this.basicAttack;
		const actor       = basicAttack.actor;
		const target      = gameData.findAlive(basicAttack.targetId);
		if (!target || target.isDead || !actor.canAttack(target)) return;
		if (Math.hypot(target.x - actor.x, target.z - actor.z) >= actor.attackRange) return;
		target.takeDamage(actor.damage);
	}
}
