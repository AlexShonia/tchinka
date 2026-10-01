export class Sender {
	constructor(receiver) {
		this._receiver = receiver;
	}

	flush(outbox) {
		const ws = this._receiver.ws;
		const msgs = outbox.flush();
		if (ws?.readyState !== WebSocket.OPEN) return;
		for (const msg of msgs) ws.send(JSON.stringify(msg));
	}
}
