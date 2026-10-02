export class AttackState {
	constructor(baseDuration) {
		this.name          = "attack";
		this._baseDuration = baseDuration;
	}

	apply(mesh, elapsed, attackSpeed = 1) {
		const duration = this._baseDuration / attackSpeed;
		const t = Math.min(elapsed / duration, 1);
		mesh.rotation.z = -0.5 + 1.1 * t;
	}
}
