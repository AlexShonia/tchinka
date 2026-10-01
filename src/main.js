import * as THREE from "three";
import { World } from "./world.js";

const SERVER = "ws://localhost:8080";

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
			// --- players ---
			const livePlayerIds = new Set(msg.players.map(p => p.id));
			removeStaleMeshes(playerMeshes, livePlayerIds);
			for (const p of msg.players) {
				const mat = p.id === myId ? myPlayerMat : playerMat;
				const mesh = getOrCreateMesh(playerMeshes, p.id, mat);
				mesh.position.set(p.x, 0.5, p.z);
			}

			// --- enemies ---
			const liveEnemyIds = new Set(msg.enemies.map(e => e.id));
			removeStaleMeshes(enemyMeshes, liveEnemyIds);
			for (const e of msg.enemies) {
				const mesh = getOrCreateMesh(enemyMeshes, e.id, enemyMat);
				mesh.position.set(e.x, 0.5, e.z);
			}

			followMyPlayer(msg.players);
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

// ── render loop ───────────────────────────────────────────────────────────────
function animate() {
	world.renderer.render(scene, camera);
}

world.renderer.setAnimationLoop(animate);
