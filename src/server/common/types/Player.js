export class Player {
	constructor(id) {
		this.id          = id;
		this.x           = 0;
		this.z           = 0;
		this.moveTarget  = null;
		this.isMoving    = false;
		this.health      = 100;
		this.mana        = 100;
		this.dead        = false;
	}
}
