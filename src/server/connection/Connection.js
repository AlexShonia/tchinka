export class Connection {
	constructor(ws, service, gameData) {
		this._service = service;
		this._player  = service.addPlayer();
		this._ws      = ws;

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
