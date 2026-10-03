import * as THREE from "three";
import { Receiver }         from "./incoming/Receiver.js";
import { Sender }           from "./outgoing/Sender.js";
import { GameState }        from "./common/GameState.js";
import { GameStateService } from "./incoming/service/GameStateService.js";
import { PingService }      from "./incoming/service/PingService.js";
import { Service }          from "./outgoing/input/service/service.js";
import { Hud }              from "./common/view/types/Hud.js";
import { createWorld }      from "./common/view/world.js";
import { InputController }  from "./outgoing/input/input.js";

const SERVER     = `ws://${location.hostname}:1234`;
const CAM_OFFSET = new THREE.Vector3(0, 4, 3);

// ── three.js setup ────────────────────────────────────────────────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-4, 10, 6);
scene.add(sun);
const world = createWorld(scene);

// ── app ───────────────────────────────────────────────────────────────────────
const gameState    = new GameState();
const pingService  = new PingService(() => receiver.ws);
const hud          = new Hud(pingService);
const stateService = new GameStateService(gameState, scene, hud);
const receiver     = new Receiver(SERVER, stateService, pingService);
const sender       = new Sender(() => receiver.ws);
const game         = new Service(camera, () => gameState.myId);

const input = new InputController(game, renderer.domElement, camera, () => gameState.enemies.values());

// ── render loop ───────────────────────────────────────────────────────────────
renderer.setAnimationLoop((now) => {
	hud.tickPerf(now);
	sender.flush(game.outbox);
	resetCameraPosition();
	input.tick();
	for (const v of gameState.enemies.values())  v.tick(now);
	for (const v of gameState.players.values())  v.tick(now);
	renderer.render(scene, camera);
});

function resetCameraPosition() {
	const p = gameState.localPlayer;
	if (p) {
		camera.position.set(p.x + CAM_OFFSET.x, CAM_OFFSET.y, p.z + CAM_OFFSET.z);
		camera.lookAt(p.x, 0, p.z);
		world.follow(p.x, p.z);
	}
}
