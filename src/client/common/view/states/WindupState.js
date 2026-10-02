export class WindupState {
	constructor(baseDuration) {
		this.name          = "windup";
		this._baseDuration = baseDuration;
	}

	apply(mesh, elapsed, attackSpeed = 1) {
		const duration = this._baseDuration / attackSpeed;
		const t = Math.min(elapsed / duration, 1);
		mesh.rotation.z = -0.5 * t;
	}
}
