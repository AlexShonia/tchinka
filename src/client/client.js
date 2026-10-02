import * as THREE from "three";
import { Receiver }         from "./incoming/Receiver.js";
import { Sender }           from "./outgoing/sender/Sender.js";
import { GameState }        from "./common/GameState.js";
import { GameStateService } from "./incoming/service/GameStateService.js";
import { PingService }      from "./incoming/service/PingService.js";
import { Service }          from "./outgoing/input/service/service.js";
import { Hud }              from "./common/view/types/Hud.js";
import { setupInput }       from "./outgoing/input/input.js";

const SERVER     = `ws://${location.hostname}:1234`;
const CAM_OFFSET = new THREE.Vector3(0, 8, 5);

// ── three.js setup ────────────────────────────────────────────────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 5);
camera.up.set(0, 0, -1);
camera.lookAt(0, 0, 0);

// ── app ───────────────────────────────────────────────────────────────────────
const hud          = new Hud();
const gameState    = new GameState();
const stateService = new GameStateService(gameState, scene, hud);
const pingService  = new PingService(() => receiver.ws);
const receiver     = new Receiver(SERVER, stateService, pingService);
const sender       = new Sender(() => receiver.ws);
const game         = new Service(camera, () => gameState.myId);

setupInput(game, renderer.domElement);

// ── render loop ───────────────────────────────────────────────────────────────
const perfEl = document.getElementById("perf");
let frameCount = 0, fps = 0, prevNow = 0;

renderer.setAnimationLoop((now) => {
	frameCount++;
	if (frameCount % 10 === 0) fps = Math.round(1000 / (now - (prevNow || now)));
	prevNow = now;
	perfEl.textContent = `${fps} fps  ${pingService.ms} ms`;

	sender.flush(game.outbox);

	const p = gameState.localPlayer;
	if (p) {
		camera.position.set(p.x + CAM_OFFSET.x, CAM_OFFSET.y, p.z + CAM_OFFSET.z);
		camera.lookAt(p.x, 0, p.z);
	}

	renderer.render(scene, camera);
});
