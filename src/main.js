import * as THREE from "three";
import { World } from "./world.js";
import { Receiver } from "./receiver.js";

const SERVER = `ws://${location.hostname}:1234`;

const world  = new World();
const scene  = world.scene;
const camera = world.camera;

// ── rendering maps ────────────────────────────────────────────────────────────
const playerMeshes = new Map(); // id -> THREE.Mesh
const enemyMeshes  = new Map(); // id -> THREE.Mesh

const playerMat   = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const myPlayerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const enemyMat    = new THREE.MeshBasicMaterial({ color: 0xff3333 });

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

// ── camera follow ─────────────────────────────────────────────────────────────
const cameraOffset = new THREE.Vector3(0, 5, 5);
let myId = null;

function followMyPlayer(players) {
	if (!myId) return;
	const me = players.find(p => p.id === myId);
	if (!me) return;
	camera.position.set(me.x + cameraOffset.x, cameraOffset.y, me.z + cameraOffset.z);
	camera.lookAt(me.x, 0, me.z);
}

// ── state application ─────────────────────────────────────────────────────────
function applyState(players, enemies) {
	const livePlayerIds = new Set(players.map(p => p.id));
	removeStaleMeshes(playerMeshes, livePlayerIds);
	for (const p of players) {
		const mat  = p.id === myId ? myPlayerMat : playerMat;
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

// ── network ───────────────────────────────────────────────────────────────────
const receiver = new Receiver(SERVER);
receiver.onWelcome = (id) => { myId = id; };
receiver.onState   = (players, enemies) => applyState(players, enemies);

// ── input ─────────────────────────────────────────────────────────────────────
window.addEventListener("mousemove", (event) => {
	world.pointerOnGround(event.clientX, event.clientY, new THREE.Vector3());
});

world.renderer.domElement.addEventListener("click", (event) => {
	const target = new THREE.Vector3();
	if (!world.pointerOnGround(event.clientX, event.clientY, target)) { console.log("no ground hit"); return; }
	console.log("move", target.x, target.z, "ws state:", receiver._ws?.readyState);
	receiver.send({ type: "move", x: target.x, z: target.z });
});

// ── perf overlay ──────────────────────────────────────────────────────────────
const perfEl = document.getElementById("perf");
let frameCount = 0;
let fps = 0;

// ── render loop ───────────────────────────────────────────────────────────────
function animate(now) {
	frameCount++;
	if (frameCount % 10 === 0) fps = Math.round(1000 / (now - (animate.prev ?? now)));
	animate.prev = now;

	perfEl.textContent = `${fps} fps  ${(1000 / (fps || 1)).toFixed(1)} ms`;

	world.renderer.render(scene, camera);
}

world.renderer.setAnimationLoop(animate);
