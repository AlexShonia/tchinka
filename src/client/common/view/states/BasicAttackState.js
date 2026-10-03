import { resetPose } from "../settle.js";
import { TILT_BACK, OVERSHOOT } from "./poses.js";

// Windup and hit as one animation: turn right during the windup, swing through to the left on the hit.
// It holds the end pose; the view settles back to center once the server reports idle (recovery).
export class BasicAttackState {
	constructor(windupMs, hitMs, mesh) {
		this.name         = "basicAttack";
		this._windupMs    = windupMs;
		this._hitMs       = hitMs;
		this._mesh        = mesh;
		this._start       = 0;
		this._attackSpeed = 1;
	}

	enter(attackSpeed = 1) {
		resetPose(this._mesh);
		this._start       = performance.now();
		this._attackSpeed = attackSpeed;
	}

	apply() {
		const elapsed = (performance.now() - this._start) * this._attackSpeed; // time in attack-speed 1 units
		const swing   = elapsed < this._windupMs
			? -TILT_BACK * (elapsed / this._windupMs)
			: -TILT_BACK + (TILT_BACK + OVERSHOOT) * Math.min((elapsed - this._windupMs) / this._hitMs, 1);

		this._mesh.rotation.x = 0;
		this._mesh.rotation.z = 0;
		this._mesh.userData.swingYaw = swing;
	}
}
