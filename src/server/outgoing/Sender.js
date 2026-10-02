import { tick } from "../gametick/tick.js";
import { StateName }        from "../gametick/states/name/StateName.js";

function _visualState(actor) {
	const s = actor.combatState.state;
	return s === StateName.BASIC_ATTACK ? actor.currentState.subStateName : s;
}

const TICK_RATE = 20;

export class Sender {
	constructor(wss, gameData) {
		this._wss      = wss;
		this._gameData = gameData;
	}

	start() {
		setInterval(() => this._tick(), TICK_RATE);
	}

	_tick() {
		tick(this._gameData);
		this._broadcast({
			type:    "state",
			wave:    this._gameData.wave,
			players: [...this._gameData.players.values()].map(p => ({ id: p.id, x: p.x, z: p.z, health: p.health, mana: p.mana, dead: p.isDead, hit: p.hit, state: _visualState(p), attackSpeed: p.attackSpeed })),
			enemies: this._gameData.enemies.map(e => ({ id: e.id, x: e.x, z: e.z, hp: e.health, maxHp: e.maxHp, state: _visualState(e), attackSpeed: e.attackSpeed })),
		});
	}

	_broadcast(msg) {
		const data = JSON.stringify(msg);
		for (const ws of this._wss.clients)
			if (ws.readyState === 1) ws.send(data);
	}
}
