export class GameState {
	constructor() {
		this.myId    = null;
		this.players = [];
		this.enemies = [];
	}

	applyWelcome(msg) { this.myId = msg.id; }
	applyState(msg)   { this.players = msg.players; this.enemies = msg.enemies; }
}
