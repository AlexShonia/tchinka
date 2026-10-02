import { Player } from "../../common/types/Player.js";

export class Service {
	constructor(gameData) {
		this._gameData = gameData;
	}

	addPlayer() {
		const id     = String(this._gameData.nextPlayerId++);
		const player = new Player(id);
		this._gameData.players.set(id, player);
		return player;
	}

	removePlayer(id) {
		this._gameData.players.delete(id);
	}

	get blocks()      { return this._gameData.blocks; }
	get playerCount() { return this._gameData.players.size; }

	movePlayer(player, x, z) {
		if (player.dead) return;
		player.states.moving.enter({ x, z });
		player.state = "moving";
	}

	attackEnemy(player, enemyId) {
		if (player.dead) return;
		player.states.targeting.enter(enemyId);
		player.state = "targeting";
	}
}
