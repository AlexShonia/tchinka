import { MoveMsg, WelcomeMsg, StateMsg } from "./protocol.js";

export class Connection {
	constructor(url, game) {
		this._url  = url;
		this._game = game;
		this._ws   = null;
		this._openConnectionToServer();
	}

	// ── send ──────────────────────────────────────────────────────────────────
	move(x, z) { this._send(new MoveMsg(x, z)); }

	_send(msg) {
		if (this._ws?.readyState === WebSocket.OPEN)
			this._ws.send(JSON.stringify(msg));
	}

	// ── connection lifecycle ──────────────────────────────────────────────────
	_openConnectionToServer() {
		const ws = this._ws = new WebSocket(this._url);

		ws.addEventListener("message", (event) => {
			const raw = JSON.parse(event.data);
			if (raw.type === "welcome") this._game.applyWelcome(new WelcomeMsg(raw.id));
			if (raw.type === "state")   this._game.applyState(new StateMsg(raw.players, raw.enemies));
		});

		ws.addEventListener("close", () => {
			console.log("Disconnected — retrying in 2s…");
			setTimeout(() => this._openConnectionToServer(), 2000);
		});

		ws.addEventListener("error", () => ws.close());
	}
}
