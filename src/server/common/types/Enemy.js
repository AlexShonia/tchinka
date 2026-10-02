export class Enemy {
	constructor(id, x, z, hp, speed, attackRange = 2.5) {
		this.id          = id;
		this.x           = x;
		this.z           = z;
		this.hp          = hp;
		this.maxHp       = hp;
		this.speed       = speed;
		this.attackRange = attackRange;
		this.offsetAngle = Math.random() * Math.PI * 2;
		this.state       = "moving";
		this.prepTimer   = 0;
		this.attackTimer = 0;
		this.attackStart = 0;
		this.target      = null;
	}
}
