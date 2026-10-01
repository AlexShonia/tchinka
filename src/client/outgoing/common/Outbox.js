export class Outbox {
	constructor() {
		this._messages = [];
	}

	push(msg) {
		this._messages.push(msg);
	}

	flush() {
		const msgs = this._messages;
		this._messages = [];
		return msgs;
	}

	get length() {
		return this._messages.length;
	}
}
