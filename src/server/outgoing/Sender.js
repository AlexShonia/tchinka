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
			type:    "state",
			wave:    this._gameData.wave,
			players: [...this._gameData.players.values()].map(p => ({ id: p.id, x: p.x, z: p.z, facing: p.facing, health: p.health, mana: p.mana, level: p.level, xp: p.xp, xpToNext: p.xpToNext, dead: p.isDead, hit: p.hit, state: p.currentState.visualState, abilities: p.abilitySnapshot, shield: p.currentState.shield ?? null, attackSpeed: p.attackSpeed })),
			enemies: this._gameData.enemies.map(e => ({ id: e.id, x: e.x, z: e.z, facing: e.facing, hp: e.health, maxHp: e.maxHp, state: e.currentState.visualState, attackSpeed: e.attackSpeed })),
		});
	}

	_broadcast(msg) {
		const data = JSON.stringify(msg);
		for (const ws of this._wss.clients)
			if (ws.readyState === 1) ws.send(data);
	}
}
