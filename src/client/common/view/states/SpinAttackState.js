import { resetPose } from "../settle.js";
import { SPIN_RATE } from "./poses.js";

// Spins around the y axis for as long as the server says we are spinning.
// The angle is wrapped, so settling afterwards doesn't unwind a pile of full turns.
export class SpinAttackState {
	constructor(mesh) {
		this.name   = "spinAttack";
		this._mesh  = mesh;
		this._start = 0;
	}

	enter() {
		resetPose(this._mesh);
		this._start = performance.now();
	}

	apply() {
		const angle = (performance.now() - this._start) * SPIN_RATE;
		this._mesh.rotation.x        = 0;
		this._mesh.rotation.z        = 0;
		this._mesh.userData.swingYaw = Math.atan2(Math.sin(angle), Math.cos(angle));
	}
}
