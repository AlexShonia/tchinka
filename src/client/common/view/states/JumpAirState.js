import { JUMP_TILT_BACK, JUMP_LAND_TILT, JUMP_CROUCH, JUMP_SQUASH, JUMP_HEIGHT, smooth } from "./poses.js";

const STRETCH_END  = 0.2; // share of the leap spent springing back up from the crouch
const SQUASH_START = 0.6; // share of the leap after which we squash for the landing

export class JumpAirState {
	constructor(baseDuration, mesh) {
		this.name          = "jumpAir";
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
		const t        = Math.min(elapsed / duration, 1);

		// stay tilted back on the way up, tip forward on the way down
		this._mesh.rotation.z = 0;
		this._mesh.userData.swingYaw = 0;
		this._mesh.rotation.x = t < 0.5
			? -JUMP_TILT_BACK
			: -JUMP_TILT_BACK + (JUMP_TILT_BACK + JUMP_LAND_TILT) * smooth((t - 0.5) / 0.5);
		this._mesh.scale.y    = t < STRETCH_END  ? JUMP_CROUCH + (1 - JUMP_CROUCH) * smooth(t / STRETCH_END)
		                      : t < SQUASH_START ? 1
		                      :                    1 - (1 - JUMP_SQUASH) * smooth((t - SQUASH_START) / (1 - SQUASH_START));
		this._mesh.position.y = 0.5 * this._mesh.scale.y + JUMP_HEIGHT * Math.sin(Math.PI * t);
	}
}
