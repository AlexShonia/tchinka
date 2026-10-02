import { StateName }        from "../../name/StateName.js";

export class WindupState {
	constructor(basicAttack) {
		this.name        = StateName.WINDUP;
		this.basicAttack = basicAttack;
		this._timer      = 0;
	}

	initialize() {
		this._timer = Math.max(1, Math.round(this.basicAttack.windupTicks / this.basicAttack.attackSpeed));
	}

	tick(gameData) {
		if (--this._timer > 0) return;
		const basicAttack = this.basicAttack;
		basicAttack._recovery.initialize();
		basicAttack._attack.initialize(gameData);
		basicAttack._current = basicAttack._attack;
	}
}
