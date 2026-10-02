export class WindupState {
	constructor(duration) {
		this.name      = "windup";
		this._duration = duration;
	}

	apply(mesh, elapsed) {
		const t = Math.min(elapsed / this._duration, 1);
		mesh.rotation.z = -0.5 * t;
	}
}
