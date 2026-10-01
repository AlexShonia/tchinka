export class Receiver {
	constructor(url, stateService) {
		this._url          = url;
		this._stateService = stateService;
		this._connect();
	}

	_connect() {
		this._ws = new WebSocket(this._url);
		this._ws.addEventListener("message", (event) => {
			const raw = JSON.parse(event.data);
			if (raw.type === "welcome") this._stateService.applyWelcome(raw);
			if (raw.type === "state")   this._stateService.applyState(raw);
		});
		this._ws.addEventListener("close", () => {
			console.log("Disconnected — retrying in 2s…");
			setTimeout(() => this._connect(), 2000);
		});
		this._ws.addEventListener("error", () => this._ws.close());
	}

	get ws() { return this._ws; }
}
