const TICK_MS = 1000;

export class Connection {
	constructor(ws, service, gameData) {
		this._service = service;
		this._player  = service.addPlayer();

		ws.send(JSON.stringify({ type: "welcome", id: this._player.id, blocks: gameData.blocks }));
		console.log(`Player ${this._player.id} joined (total: ${gameData.players.size})`);

		ws.on("message", (raw) => this._onMessage(raw));
		ws.on("close",   ()    => this._onClose(gameData));
	}

	_onMessage(raw) {
		let msg;
		try { msg = JSON.parse(raw); } catch { return; }

		if (msg.type === "move"  && msg.x != null && msg.z != null)
			this._service.movePlayer(this._player, msg.x, msg.z);

		if (msg.type === "shoot" && msg.x != null && msg.z != null)
			this._service.shoot(this._player, msg.x, msg.z);
	}

	_onClose(gameData) {
		this._service.removePlayer(this._player.id);
		console.log(`Player ${this._player.id} left (total: ${gameData.players.size})`);
	}
}

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
