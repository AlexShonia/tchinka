import { createServer }              from "http";
import { readFileSync, existsSync }  from "fs";
import { join, extname }             from "path";
import { fileURLToPath }             from "url";
import { WebSocketServer }           from "ws";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST      = join(__dirname, "../../dist");

const MIME = {
	".html": "text/html",
	".js":   "application/javascript",
	".css":  "text/css",
	".png":  "image/png",
	".svg":  "image/svg+xml",
	".ico":  "image/x-icon",
	".woff2":"font/woff2",
};

const httpServer = createServer((req, res) => {
	const url      = req.url.split("?")[0];
	const filePath = join(DIST, url === "/" ? "index.html" : url);
	if (!existsSync(filePath)) { res.writeHead(404); res.end("Not found"); return; }
	const mime = MIME[extname(filePath)] ?? "application/octet-stream";
	res.writeHead(200, { "Content-Type": mime });
	res.end(readFileSync(filePath));
});

// ── constants ─────────────────────────────────────────────────────────────────
const PORT         = 1234;
const TICK_MS      = 1000;
const ENEMY_SPEED  = 0.05;
const ENEMY_COUNT  = 5;
const PLAYER_SPEED = 0.1;
const PROJ_SPEED   = 0.3;
const PROJ_LIFE    = 120;

const VOLLEY_COUNT  = 5;
const VOLLEY_RANGE  = 8;
const VOLLEY_SPREAD = Math.PI / 3;

// ── state ─────────────────────────────────────────────────────────────────────
const clients     = new Map(); // id -> ws
const players     = new Map(); // id -> { id, x, z, moveTarget, isMoving }
const projectiles = new Map(); // id -> { id, issuerId, x, z, toX, toZ, dirX, dirZ, landed, life }
let nextId     = 1;
let nextProjId = 0;

const enemies = Array.from({ length: ENEMY_COUNT }, (_, i) => ({
	id: `e${i}`,
	x: (Math.random() - 0.5) * 20,
	z: (Math.random() - 0.5) * 20,
}));

// ── helpers ───────────────────────────────────────────────────────────────────
function broadcast(msg) {
	const data = JSON.stringify(msg);
	for (const ws of clients.values())
		if (ws.readyState === 1) ws.send(data);
}

function spawnVolley(player, aimX, aimZ) {
	const dx  = aimX - player.x;
	const dz  = aimZ - player.z;
	const len = Math.sqrt(dx * dx + dz * dz) || 1;
	const baseAngle = Math.atan2(dx / len, dz / len);

	for (let i = 0; i < VOLLEY_COUNT; i++) {
		const t     = VOLLEY_COUNT === 1 ? 0.5 : i / (VOLLEY_COUNT - 1);
		const angle = baseAngle - VOLLEY_SPREAD / 2 + t * VOLLEY_SPREAD;
		const dirX  = Math.sin(angle);
		const dirZ  = Math.cos(angle);
		const id    = String(nextProjId++);
		projectiles.set(id, {
			id,
			issuerId: player.id,
			x: player.x, z: player.z,
			toX: player.x + dirX * VOLLEY_RANGE,
			toZ: player.z + dirZ * VOLLEY_RANGE,
			dirX, dirZ,
			landed: false,
			life: PROJ_LIFE,
		});
	}
}

// ── websocket ─────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
	const id     = String(nextId++);
	const player = { id, x: 0, z: 0, moveTarget: null, isMoving: false };
	players.set(id, player);
	clients.set(id, ws);

	ws.send(JSON.stringify({ type: "welcome", id }));
	console.log(`Player ${id} joined (total: ${players.size})`);

	ws.on("message", (raw) => {
		let msg;
		try { msg = JSON.parse(raw); } catch { return; }

		if (msg.type === "move"  && msg.x != null && msg.z != null) {
			player.moveTarget = { x: msg.x, z: msg.z };
			player.isMoving   = true;
		}
		if (msg.type === "shoot" && msg.x != null && msg.z != null) {
			spawnVolley(player, msg.x, msg.z);
		}
	});

	ws.on("close", () => {
		players.delete(id);
		clients.delete(id);
		console.log(`Player ${id} left (total: ${players.size})`);
	});
});

// ── tick ──────────────────────────────────────────────────────────────────────
function tickPlayers() {
	for (const p of players.values()) {
		if (!p.isMoving || !p.moveTarget) continue;
		const dx   = p.moveTarget.x - p.x;
		const dz   = p.moveTarget.z - p.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= PLAYER_SPEED) {
			p.x = p.moveTarget.x; p.z = p.moveTarget.z; p.isMoving = false;
		} else {
			p.x += (dx / dist) * PLAYER_SPEED;
			p.z += (dz / dist) * PLAYER_SPEED;
		}
	}
}

function tickEnemies() {
	const playerList = [...players.values()];
	if (playerList.length === 0) return;
	for (const e of enemies) {
		let nearest = playerList[0], nearestDist = Infinity;
		for (const p of playerList) {
			const d = Math.hypot(p.x - e.x, p.z - e.z);
			if (d < nearestDist) { nearestDist = d; nearest = p; }
		}
		const dx   = nearest.x - e.x;
		const dz   = nearest.z - e.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist > 0.1) { e.x += (dx / dist) * ENEMY_SPEED; e.z += (dz / dist) * ENEMY_SPEED; }
	}
}

function tickProjectiles() {
	for (const [id, p] of projectiles) {
		if (p.landed) {
			if (--p.life <= 0) projectiles.delete(id);
			continue;
		}
		const dx   = p.toX - p.x;
		const dz   = p.toZ - p.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= PROJ_SPEED) {
			p.x = p.toX; p.z = p.toZ; p.landed = true;
		} else {
			p.x += p.dirX * PROJ_SPEED;
			p.z += p.dirZ * PROJ_SPEED;
		}
	}
}

setInterval(() => {
	tickPlayers();
	tickEnemies();
	tickProjectiles();

	broadcast({
		type:        "state",
		players:     [...players.values()].map(p => ({ id: p.id, x: p.x, z: p.z })),
		enemies:     enemies.map(e => ({ id: e.id, x: e.x, z: e.z })),
		projectiles: [...projectiles.values()].map(p => ({ id: p.id, issuerId: p.issuerId, x: p.x, z: p.z, toX: p.toX, toZ: p.toZ })),
	});
}, TICK_MS);

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
