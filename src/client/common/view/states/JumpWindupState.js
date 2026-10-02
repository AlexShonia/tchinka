import { JUMP_TILT_BACK, JUMP_CROUCH, smooth } from "./poses.js";

export class JumpWindupState {
	constructor(baseDuration, mesh) {
		this.name          = "jumpWindup";
		this.drivesScale   = true;
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
		const t        = smooth(Math.min(elapsed / duration, 1));
		this._mesh.rotation.z = 0;
		this._mesh.userData.swingYaw = 0;
		this._mesh.rotation.x = -JUMP_TILT_BACK * t;
		this._mesh.scale.y    = 1 - (1 - JUMP_CROUCH) * t;
		this._mesh.position.y = 0.5 * this._mesh.scale.y;
	}
}
