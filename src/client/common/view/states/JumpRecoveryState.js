import { JUMP_LAND_TILT } from "./poses.js";

// straightens out of the landing pitch; the scale squash is eased back by the view
export class JumpRecoveryState {
	constructor(baseDuration, mesh) {
		this.name          = "jumpRecovery";
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
		this._mesh.rotation.z = 0;
		this._mesh.userData.swingYaw = 0;
		this._mesh.rotation.x = JUMP_LAND_TILT * (1 - t);
	}
}
