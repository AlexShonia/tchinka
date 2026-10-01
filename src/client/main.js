import * as THREE from "three";
import { Connection } from "./connection/Connection.js";
import { GameState }  from "./entity/types/GameState.js";
import { Service }    from "./model/service.js";
import { Display }    from "./view/display.js";
import { setupInput } from "./controller/input.js";

const SERVER = `ws://${location.hostname}:1234`;

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
const gameState = new GameState();
const game      = new Service(camera, gameState);
const display   = new Display(scene, camera);
const conn      = new Connection(SERVER, gameState);

setupInput(game, renderer.domElement);

// ── render loop ───────────────────────────────────────────────────────────────
const perfEl = document.getElementById("perf");
let frameCount = 0, fps = 0, prevNow = 0;

renderer.setAnimationLoop((now) => {
	frameCount++;
	if (frameCount % 10 === 0) fps = Math.round(1000 / (now - (prevNow || now)));
	prevNow = now;
	perfEl.textContent = `${fps} fps  ${(1000 / (fps || 1)).toFixed(1)} ms`;

	conn.flush(game.outbox);
	display.update(gameState);
	renderer.render(scene, camera);
});
