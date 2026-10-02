export class Projectile {
	constructor(id, issuerId, x, z, toX, toZ, dirX, dirZ, life) {
		this.id       = id;
		this.issuerId = issuerId;
		this.x        = x;
		this.z        = z;
		this.toX      = toX;
		this.toZ      = toZ;
		this.dirX     = dirX;
		this.dirZ     = dirZ;
		this.state    = "idle";
		this.landed   = false;
		this.life     = life;
	}
}
