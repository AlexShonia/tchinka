import { tick } from "../gametick/tick.js";

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
			type:        "state",
			wave:        this._gameData.wave,
			players:     [...this._gameData.players.values()].map(p => ({ id: p.id, x: p.x, z: p.z, health: p.health, mana: p.mana, dead: p.dead, hit: p.hit, attackStart: p.states.windup.start, state: p.state, attackSpeed: p.attackSpeed })),
			enemies:     this._gameData.enemies.map(e => ({ id: e.id, x: e.x, z: e.z, hp: e.hp, maxHp: e.maxHp, state: e.state, attackStart: e.states.windup.start, attackSpeed: e.attackSpeed })),
		});
	}

	_broadcast(msg) {
		const data = JSON.stringify(msg);
		for (const ws of this._wss.clients)
			if (ws.readyState === 1) ws.send(data);
	}
}
