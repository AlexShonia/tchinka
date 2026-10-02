export class Sender {
	constructor(getWs) {
		this._getWs = getWs;
	}

	flush(outbox) {
		const ws = this._getWs();
		const msgs = outbox.flush();
		if (ws?.readyState !== WebSocket.OPEN) return;
		for (const msg of msgs) ws.send(JSON.stringify(msg));
	}
}
