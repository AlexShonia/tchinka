export class Sender {
	constructor(receiver) {
		this._receiver = receiver;
	}

	flush(outbox) {
		const ws = this._receiver.ws;
		if (ws?.readyState !== WebSocket.OPEN) { outbox.length = 0; return; }
		for (const msg of outbox) ws.send(JSON.stringify(msg));
		outbox.length = 0;
	}
}
