import { Entity } from "./Entity.js";

export class Player extends Entity {
	constructor() {
		super();
		this.health = 100;
		this.mana   = 100;
	}
}
