import { resetPose } from "../settle.js";
import { THROW_WIND_UP, THROW_FOLLOW, smooth } from "./poses.js";

// Pull the arm back during the windup, snap through on the throw and hold that pose until the shield is caught.
export class ShieldThrowState {
	constructor(windupMs, mesh) {
		this.name      = "shieldThrow";
		this._windupMs = windupMs;
		this._mesh     = mesh;
		this._start    = 0;
	}

	enter() {
		resetPose(this._mesh);
		this._start = performance.now();
	}

	apply() {
		const elapsed = performance.now() - this._start;
		const swing   = elapsed < this._windupMs
			? THROW_WIND_UP * smooth(elapsed / this._windupMs)
			: THROW_WIND_UP + (THROW_FOLLOW - THROW_WIND_UP) * smooth(Math.min((elapsed - this._windupMs) / 120, 1));
		this._mesh.rotation.x        = 0;
		this._mesh.rotation.z        = 0;
		this._mesh.userData.swingYaw = swing;
	}
}
