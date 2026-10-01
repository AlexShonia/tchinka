export class Enemy {
	constructor(id, x, z, hp, speed) {
		this.id            = id;
		this.x             = x;
		this.z             = z;
		this.hp            = hp;
		this.maxHp         = hp;
		this.speed         = speed;
		this.attackCooldown = 0;
	}
}
