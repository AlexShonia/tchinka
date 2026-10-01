export class Projectile {
	constructor(id, issuerId, from, to) {
		this.id       = id;
		this.issuerId = issuerId;
		this.x        = from.x;
		this.z        = from.z;
		this.toX      = to.x;
		this.toZ      = to.z;
		this.speed    = 0.3;
		this.landed   = false;
		this.life     = 60;
	}

	tick() {
		if (this.landed) { this.life--; return; }
		const dx   = this.toX - this.x;
		const dz   = this.toZ - this.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= this.speed) {
			this.x = this.toX; this.z = this.toZ; this.landed = true;
		} else {
			this.x += (dx / dist) * this.speed;
			this.z += (dz / dist) * this.speed;
		}
	}

	get alive() { return this.life > 0; }
}
