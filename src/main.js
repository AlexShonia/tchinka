import * as THREE from "three";
import { World } from "./world.js";
import { Player } from "./player.js";

const world = new World();
const player = new Player(world.scene);

const keys = new Set();
const mouseWorld = new THREE.Vector3();

window.addEventListener("keydown", (event) => {
	const key = event.key.toLowerCase();
	if (key === "2" && !keys.has("2")) {
		player.fireVolley(mouseWorld);
	}
	keys.add(key);
});

window.addEventListener("keyup", (event) => {
	keys.delete(event.key.toLowerCase());
});

window.addEventListener("mousemove", (event) => {
	world.pointerOnGround(event.clientX, event.clientY, mouseWorld);
});

world.renderer.domElement.addEventListener("click", (event) => {
	const target = new THREE.Vector3();
	if (!world.pointerOnGround(event.clientX, event.clientY, target)) return;
	player.setMoveTarget(target);
});

function animate() {
	player.update(world.camera);
	world.renderer.render(world.scene, world.camera);
}

world.renderer.setAnimationLoop(animate);
