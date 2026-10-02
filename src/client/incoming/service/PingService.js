export class PingService {
	constructor(getWs) {
		this._getWs = getWs;
		this._ms    = 0;
		setInterval(() => this._ping(), 1000);
	}

	_ping() {
		const ws = this._getWs();
		if (ws?.readyState === WebSocket.OPEN)
			ws.send(JSON.stringify({ type: "ping", clientTime: Date.now() }));
	}

	onPong(msg) { this._ms = Date.now() - msg.clientTime; }
	get ms()    { return this._ms; }
}
