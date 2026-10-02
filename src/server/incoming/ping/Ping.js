export class Ping {
	onPing(ws, msg) {
		ws.send(JSON.stringify({ type: "pong", clientTime: msg.clientTime }));
	}
}
