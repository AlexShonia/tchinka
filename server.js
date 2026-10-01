import { WebSocketServer } from "ws";

const PORT = 1234;
const TICK_MS = 50; // 20 ticks/s
const ENEMY_SPEED = 0.05;
const ENEMY_COUNT = 5;

const wss = new WebSocketServer({ port: PORT });

let nextId = 1;
const players = new Map(); // id -> { id, x, z, moveTarget, isMoving }

const enemies = Array.from({ length: ENEMY_COUNT }, (_, i) => ({
	id: `e${i}`,
	x: (Math.random() - 0.5) * 20,
	z: (Math.random() - 0.5) * 20,
	speed: ENEMY_SPEED,
}));

function broadcast(msg) {
	const data = JSON.stringify(msg);
	for (const [, ws] of clients) {
		if (ws.readyState === 1) ws.send(data);
	}
}

const clients = new Map(); // id -> ws

wss.on("connection", (ws) => {
	const id = String(nextId++);
	const player = { id, x: 0, z: 0, moveTarget: null, isMoving: false };
	players.set(id, player);
	clients.set(id, ws);

	ws.send(JSON.stringify({ type: "welcome", id }));
	console.log(`Player ${id} joined (total: ${players.size})`);

	ws.on("message", (raw) => {
		let msg;
		try { msg = JSON.parse(raw); } catch { return; }

		if (msg.type === "move" && msg.x != null && msg.z != null) {
			player.moveTarget = { x: msg.x, z: msg.z };
			player.isMoving = true;
		}
	});

	ws.on("close", () => {
		players.delete(id);
		clients.delete(id);
		console.log(`Player ${id} left (total: ${players.size})`);
	});
});

function tickPlayers() {
	for (const p of players.values()) {
		if (!p.isMoving || !p.moveTarget) continue;
		const dx = p.moveTarget.x - p.x;
		const dz = p.moveTarget.z - p.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		const speed = 0.1;
		if (dist <= speed) {
			p.x = p.moveTarget.x;
			p.z = p.moveTarget.z;
			p.isMoving = false;
		} else {
			p.x += (dx / dist) * speed;
			p.z += (dz / dist) * speed;
		}
	}
}

function tickEnemies() {
	const playerList = [...players.values()];
	if (playerList.length === 0) return;

	for (const e of enemies) {
		// Chase nearest player
		let nearest = playerList[0];
		let nearestDist = Infinity;
		for (const p of playerList) {
			const d = Math.hypot(p.x - e.x, p.z - e.z);
			if (d < nearestDist) { nearestDist = d; nearest = p; }
		}
		const dx = nearest.x - e.x;
		const dz = nearest.z - e.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist > 0.1) {
			e.x += (dx / dist) * e.speed;
			e.z += (dz / dist) * e.speed;
		}
	}
}

setInterval(() => {
	tickPlayers();
	tickEnemies();

	broadcast({
		type: "state",
		players: [...players.values()].map(p => ({ id: p.id, x: p.x, z: p.z })),
		enemies: enemies.map(e => ({ id: e.id, x: e.x, z: e.z })),
	});
}, TICK_MS);

console.log(`Server running on ws://localhost:${PORT}`);
