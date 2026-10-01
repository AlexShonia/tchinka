import * as THREE from "three";

export function setupInput(world, conn) {
	world.renderer.domElement.addEventListener("click", (event) => {
		const target = new THREE.Vector3();
		if (!world.pointerOnGround(event.clientX, event.clientY, target)) return;
		conn.move(target.x, target.z);
	});
}
