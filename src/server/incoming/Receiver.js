export class Receiver {
	constructor(ws, service) {
		this._service = service;
		this._player  = service.addPlayer();

		ws.send(JSON.stringify({ type: "welcome", id: this._player.id, blocks: service.blocks }));
		console.log(`Player ${this._player.id} joined (total: ${service.playerCount})`);

		ws.on("message", (raw) => this._onMessage(raw));
		ws.on("close",   ()    => this._onClose());
	}

	_onMessage(raw) {
		let msg;
		try { msg = JSON.parse(raw); } catch { return; }

		if (msg.type === "move"  && msg.x != null && msg.z != null)
			this._service.movePlayer(this._player, msg.x, msg.z);

		if (msg.type === "shoot" && msg.x != null && msg.z != null)
			this._service.shoot(this._player, msg.x, msg.z);
	}

	_onClose() {
		this._service.removePlayer(this._player.id);
		console.log(`Player ${this._player.id} left (total: ${this._service.playerCount})`);
	}
}
