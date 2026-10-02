export class Player {
	constructor(id) {
		this.id          = id;
		this.x           = 0;
		this.z           = 0;
		this.moveTarget  = null;
		this.isMoving    = false;
		this.health      = 100;
		this.mana        = 100;
		this.state         = "idle";
		this.dead          = false;
		this.hit           = false;
		this.targetEnemyId = null;
		this.attackRange    = 3;
		this.attackSpeed    = 1;
		this.attackTimer    = 0;
		this.attackCooldown = 0;
		this.attackStart    = 0;
	}
}
