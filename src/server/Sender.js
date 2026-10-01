const TICK_MS = 1000;

export class Sender {
	constructor(wss, service, gameData) {
		this._wss      = wss;
		this._service  = service;
		this._gameData = gameData;
	}

	start() {
		setInterval(() => this._tick(), TICK_MS);
	}

	_tick() {
		this._service.tick();
		this._broadcast({
			type:        "state",
			players:     [...this._gameData.players.values()].map(p => ({ id: p.id, x: p.x, z: p.z })),
			enemies:     this._gameData.enemies.map(e => ({ id: e.id, x: e.x, z: e.z })),
			projectiles: [...this._gameData.projectiles.values()].map(p => ({ id: p.id, issuerId: p.issuerId, x: p.x, z: p.z, toX: p.toX, toZ: p.toZ })),
		});
	}

	_broadcast(msg) {
		const data = JSON.stringify(msg);
		for (const ws of this._wss.clients)
			if (ws.readyState === 1) ws.send(data);
	}
}
