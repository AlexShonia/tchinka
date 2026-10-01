import * as THREE from "three";
import { World } from "./world.js";

const SERVER = import.meta.env.VITE_WS_URL ?? "ws://176.221.250.70:1234";

const world = new World();
const scene = world.scene;
const camera = world.camera;

// ── rendering maps ──────────────────────────────────────────────────────────
const playerMeshes = new Map();  // id -> THREE.Mesh
const enemyMeshes  = new Map();  // id -> THREE.Mesh

const playerMat = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const myPlayerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const enemyMat  = new THREE.MeshBasicMaterial({ color: 0xff3333 });

function getOrCreateMesh(map, id, mat) {
	if (!map.has(id)) {
		const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
		scene.add(mesh);
		map.set(id, mesh);
	}
	return map.get(id);
}

function removeStaleMeshes(map, liveIds) {
	for (const [id, mesh] of map) {
		if (!liveIds.has(id)) {
			scene.remove(mesh);
			map.delete(id);
		}
	}
}

// ── camera follow ────────────────────────────────────────────────────────────
const cameraOffset = new THREE.Vector3(0, 5, 5);
let myId = null;

function followMyPlayer(players) {
	if (!myId) return;
	const me = players.find(p => p.id === myId);
	if (!me) return;
	camera.position.set(me.x + cameraOffset.x, cameraOffset.y, me.z + cameraOffset.z);
	camera.lookAt(me.x, 0, me.z);
}

// ── Snapshot interpolation ───────────────────────────────────────────────────
const RENDER_DELAY = 150; // ms behind live — buffer for network jitter
const snapshotBuffer = []; // { time, players, enemies }[]

function applySnapshot(players, enemies) {
	const livePlayerIds = new Set(players.map(p => p.id));
	removeStaleMeshes(playerMeshes, livePlayerIds);
	for (const p of players) {
		const mat = p.id === myId ? myPlayerMat : playerMat;
		const mesh = getOrCreateMesh(playerMeshes, p.id, mat);
		mesh.position.set(p.x, 0.5, p.z);
	}

	const liveEnemyIds = new Set(enemies.map(e => e.id));
	removeStaleMeshes(enemyMeshes, liveEnemyIds);
	for (const e of enemies) {
		const mesh = getOrCreateMesh(enemyMeshes, e.id, enemyMat);
		mesh.position.set(e.x, 0.5, e.z);
	}

	followMyPlayer(players);
}

function lerpEntities(aList, bList, t) {
	const bMap = new Map(bList.map(e => [e.id, e]));
	return aList.map(a => {
		const b = bMap.get(a.id);
		if (!b) return a;
		return { id: a.id, x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
	});
}

function tickInterpolation() {
	if (snapshotBuffer.length < 2) return;

	const renderTime = Date.now() - RENDER_DELAY;

	// Drop snapshots too old to be useful (keep one before renderTime as anchor)
	while (snapshotBuffer.length > 2 && snapshotBuffer[1].time <= renderTime) {
		snapshotBuffer.shift();
	}

	const a = snapshotBuffer[0];
	const b = snapshotBuffer[1];

	if (renderTime < a.time) {
		// Haven't buffered enough yet — show oldest we have
		applySnapshot(a.players, a.enemies);
		return;
	}

	const span = b.time - a.time;
	const t = span > 0 ? Math.min((renderTime - a.time) / span, 1) : 1;

	applySnapshot(
		lerpEntities(a.players, b.players, t),
		lerpEntities(a.enemies, b.enemies, t),
	);
}

// ── WebSocket ─────────────────────────────────────────────────────────────────
let ws = null;

function connect() {
	ws = new WebSocket(SERVER);

	ws.addEventListener("open", () => {
		console.log("Connected to server");
	});

	ws.addEventListener("message", (event) => {
		const msg = JSON.parse(event.data);

		if (msg.type === "welcome") {
			myId = msg.id;
			console.log("My player id:", myId);
			return;
		}

		if (msg.type === "state") {
			snapshotBuffer.push({ time: Date.now(), players: msg.players, enemies: msg.enemies });
		}
	});

	ws.addEventListener("close", () => {
		console.log("Disconnected — retrying in 2s…");
		setTimeout(connect, 2000);
	});

	ws.addEventListener("error", () => ws.close());
}

connect();

// ── input ────────────────────────────────────────────────────────────────────
const mouseWorld = new THREE.Vector3();

window.addEventListener("mousemove", (event) => {
	world.pointerOnGround(event.clientX, event.clientY, mouseWorld);
});

world.renderer.domElement.addEventListener("click", (event) => {
	const target = new THREE.Vector3();
	if (!world.pointerOnGround(event.clientX, event.clientY, target)) return;
	if (ws && ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({ type: "move", x: target.x, z: target.z }));
	}
});

// ── perf overlay ─────────────────────────────────────────────────────────────
const perfEl = document.getElementById("perf");
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// ── render loop ───────────────────────────────────────────────────────────────
function animate() {
	const now = performance.now();
	const ms = now - lastFrameTime;
	lastFrameTime = now;

	frameCount++;
	if (frameCount % 10 === 0) fps = Math.round(1000 / ms);

	perfEl.textContent = `${fps} fps\n${ms.toFixed(1)} ms`;

	tickInterpolation();
	world.renderer.render(scene, camera);
}

world.renderer.setAnimationLoop(animate);
