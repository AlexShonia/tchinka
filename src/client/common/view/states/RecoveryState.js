export class RecoveryState {
	constructor(baseDuration) {
		this.name          = "recovery";
		this._baseDuration = baseDuration;
	}

	apply(mesh, elapsed, attackSpeed = 1) {
		const duration = this._baseDuration / attackSpeed;
		const t = Math.min(elapsed / duration, 1);
		mesh.rotation.z = 0.6 * (1 - t);
	}
}
