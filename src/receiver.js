export class Receiver {
	constructor(url) {
		this.onWelcome = null; // (id) => {}
		this.onState   = null; // (players, enemies) => {}
		this._url = url;
		this._ws  = null;
		this._connect();
	}

	send(msg) {
		if (this._ws?.readyState === WebSocket.OPEN)
			this._ws.send(JSON.stringify(msg));
	}

	_connect() {
		const ws = this._ws = new WebSocket(this._url);

		ws.addEventListener("message", (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === "welcome") this.onWelcome?.(msg.id);
			if (msg.type === "state")   this.onState?.(msg.players, msg.enemies);
		});

		ws.addEventListener("close", () => {
			console.log("Disconnected — retrying in 2s…");
			setTimeout(() => this._connect(), 2000);
		});

		ws.addEventListener("error", () => ws.close());
	}
}
