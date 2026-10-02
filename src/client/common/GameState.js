export class GameState {
	constructor() {
		this.myId        = null;
		this.wave        = 1;
		this.players     = new Map();
		this.enemies     = new Map();
		this.blocks      = new Map();
	}

	get localPlayer() { return this.players.get(this.myId) ?? null; }
}
