export class AttackState {
	constructor(duration) {
		this.name      = "attack";
		this._duration = duration;
	}

	apply(mesh, elapsed) {
		const t = Math.min(elapsed / this._duration, 1);
		mesh.rotation.z = -0.5 + 1.1 * t;
	}
}
