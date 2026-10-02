import { Player }      from "../../common/types/Player.js";
import { StateEvent }  from "../../gametick/states/name/StateEvent.js";

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
		player.transition(StateEvent.MOVE_REQUESTED, { moveTarget: { x, z } });
	}

	attackEnemy(player, enemyId) {
		player.transition(StateEvent.ATTACK_REQUESTED, { targetId: enemyId });
	}
}
