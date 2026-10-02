export class RecoveryState {
	constructor(duration) {
		this.name      = "recovery";
		this._duration = duration;
	}

	apply(mesh, elapsed) {
		const t = Math.min(elapsed / this._duration, 1);
		mesh.rotation.z = 0.6 * (1 - t);
	}
}
