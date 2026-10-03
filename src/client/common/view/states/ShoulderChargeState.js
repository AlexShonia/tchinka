import { resetPose } from "../settle.js";
import { CHARGE_PITCH, CHARGE_YAW, smooth } from "./poses.js";

// Lean in and turn the shoulder to the target during the windup, then hold that pose for the whole rush.
// The view settles back to rest once the server reports idle (recovery).
export class ShoulderChargeState {
	constructor(windupMs, mesh) {
		this.name      = "shoulderCharge";
		this._windupMs = windupMs;
		this._mesh     = mesh;
		this._start    = 0;
	}

	enter() {
		resetPose(this._mesh);
		this._start = performance.now();
	}

	apply() {
		const t = smooth(Math.min((performance.now() - this._start) / this._windupMs, 1));
		this._mesh.rotation.x        = CHARGE_PITCH * t;
		this._mesh.rotation.z        = 0;
		this._mesh.userData.swingYaw = CHARGE_YAW * t;
	}
}
