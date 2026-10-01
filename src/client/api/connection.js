export class Connection {
	constructor(url, game) {
		this._url  = url;
		this._game = game;
		this._ws   = new WebSocket(url);
		this._listen(this._ws);
	}

	// ── send ──────────────────────────────────────────────────────────────────
	flush(outbox) {
		for (const msg of outbox) this._send(msg);
		outbox.length = 0;
	}

	_send(msg) {
		if (this._ws?.readyState === WebSocket.OPEN)
			this._ws.send(JSON.stringify(msg));
	}

	_listen(ws) {
		ws.addEventListener("message", (event) => {
			const raw = JSON.parse(event.data);
			if (raw.type === "welcome") this._game.applyWelcome(raw);
			if (raw.type === "state")   this._game.applyState(raw);
		});

		ws.addEventListener("close", () => {
			console.log("Disconnected — retrying in 2s…");
			setTimeout(() => this._reconnect(), 2000);
		});

		ws.addEventListener("error", () => ws.close());
	}

	// ── connection lifecycle ──────────────────────────────────────────────────
	_reconnect() {
		this._ws = new WebSocket(this._url);
		this._listen(this._ws);
	}

}
