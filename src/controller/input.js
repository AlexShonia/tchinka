import * as THREE from "three";

export function setupInput(world, conn, game) {
	let mouseX = 0, mouseY = 0;

	window.addEventListener("mousemove", (event) => {
		mouseX = event.clientX;
		mouseY = event.clientY;
	});

	world.renderer.domElement.addEventListener("click", (event) => {
		const target = new THREE.Vector3();
		if (!world.pointerOnGround(event.clientX, event.clientY, target)) return;
		conn.move(target.x, target.z);
	});

	window.addEventListener("keydown", (event) => {
		if (event.key !== "1") return;
		const target = new THREE.Vector3();
		if (!world.pointerOnGround(mouseX, mouseY, target)) return;
		game.localPlayer?.fireVolley(target);
		conn.shoot(target.x, target.z);
	});
}
