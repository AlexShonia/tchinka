export class PingService {
	constructor() { this._ms = 0; }
	onPong(msg)   { this._ms = Date.now() - msg.clientTime; }
	get ms()      { return this._ms; }
}
