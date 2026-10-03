import { Player }      from "../../common/types/Player.js";
import { Event }  from "../../gametick/transitions/types/Event.js";
import { AbilityName } from "../../gametick/states/name/AbilityName.js";

const ABILITY_KEYS = { q: AbilityName.JUMPING_ATTACK };

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
		player.transition(Event.MOVE_REQUESTED, { moveTarget: { x, z } });
	}

	useAbility(player, key) {
		const ability = ABILITY_KEYS[key];
		if (ability) player.useAbility(ability);
	}

	attackEnemy(player, enemyId) {
		player.transition(Event.ATTACK_REQUESTED, { targetId: enemyId });
	}
}
