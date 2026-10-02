import { TILT_BACK, OVERSHOOT } from "./poses.js";

export class HitState {
	constructor(baseDuration, mesh) {
		this.name          = "hit";
		this._baseDuration = baseDuration;
		this._mesh         = mesh;
		this._start        = 0;
		this._attackSpeed  = 1;
	}

	enter(attackSpeed = 1) {
		this._start       = performance.now();
		this._attackSpeed = attackSpeed;
	}

	apply() {
		const elapsed  = performance.now() - this._start;
		const duration = this._baseDuration / this._attackSpeed;
		const t        = Math.min(elapsed / duration, 1);
		this._mesh.rotation.z = -TILT_BACK + (TILT_BACK + OVERSHOOT) * t;
	}
}
