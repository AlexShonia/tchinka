import { resetPose } from "../settle.js";
import { JUMP_TILT_BACK, JUMP_LAND_TILT, JUMP_CROUCH, JUMP_SQUASH, JUMP_HEIGHT, smooth } from "./poses.js";

const STRETCH_END  = 0.2; // share of the leap spent springing back up from the crouch
const SQUASH_START = 0.6; // share of the leap after which we squash for the landing

// Windup and leap as one animation, pitching around the x axis: crouch and tilt back, leap (tilted back going up,
// tipping forward coming down, squashing on landing). It holds the landing pose; the view settles back to rest
// once the server reports idle (recovery).
export class JumpAttackState {
	constructor(windupMs, airMs, mesh) {
		this.name         = "jumpAttack";
		this.drivesScale  = true;
		this._windupMs    = windupMs;
		this._airMs       = airMs;
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
		const mesh    = this._mesh;
		let pitch, scale, lift = 0;

		if (elapsed < this._windupMs) {              // windup
			const t = smooth(elapsed / this._windupMs);
			pitch = -JUMP_TILT_BACK * t;
			scale = 1 - (1 - JUMP_CROUCH) * t;
		} else {                                     // air
			const t = Math.min((elapsed - this._windupMs) / this._airMs, 1);
			pitch = t < 0.5 ? -JUMP_TILT_BACK : -JUMP_TILT_BACK + (JUMP_TILT_BACK + JUMP_LAND_TILT) * smooth((t - 0.5) / 0.5);
			scale = t < STRETCH_END  ? JUMP_CROUCH + (1 - JUMP_CROUCH) * smooth(t / STRETCH_END)
			      : t < SQUASH_START ? 1
			      :                    1 - (1 - JUMP_SQUASH) * smooth((t - SQUASH_START) / (1 - SQUASH_START));
			lift  = JUMP_HEIGHT * Math.sin(Math.PI * t);
		}

		mesh.rotation.x = pitch;
		mesh.rotation.z = 0;
		mesh.userData.swingYaw = 0;
		mesh.scale.y    = scale;
		mesh.position.y = 0.5 * scale + lift;
	}
}
