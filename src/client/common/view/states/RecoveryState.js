const TILT_BACK = 0.5;
const OVERSHOOT = 0.6;
const STRIKE_T  = 0.2; // first 20% of recovery = forward swing; rest = ease back

export class RecoveryState {
	constructor(baseDuration, mesh) {
		this.name          = "recovery";
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

		if (t < STRIKE_T) {
			const phase = t / STRIKE_T;
			this._mesh.rotation.z = -TILT_BACK + (TILT_BACK + OVERSHOOT) * phase;
		} else {
			const phase = (t - STRIKE_T) / (1 - STRIKE_T);
			this._mesh.rotation.z = OVERSHOOT * (1 - phase);
		}
	}
}
