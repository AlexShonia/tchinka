export class Player {
	constructor(id) {
		this.id          = id;
		this.x           = 0;
		this.z           = 0;
		this.moveTarget  = null;
		this.isMoving    = false;
		this.health      = 100;
		this.mana        = 100;
		this.dead          = false;
		this.hit           = false;
		this.targetEnemyId = null;
		this.attackRange    = 2.2;
		this.attackState    = null;
		this.attackTimer    = 0;
		this.attackCooldown = 0;
		this.attackStart    = 0;
	}
}
