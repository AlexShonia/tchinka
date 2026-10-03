import * as THREE from "three";

// A plain green ground made of a repeating tile. It follows the player so it never ends.

const GROUND_SIZE = 480;
const TILE        = 8; // world units covered by one repeat of the texture

function tileTexture() {
	const size = 128;
	const c    = document.createElement("canvas");
	c.width = c.height = size;
	const g = c.getContext("2d");
	g.fillStyle = "#4f8f3a";
	g.fillRect(0, 0, size, size);
	g.fillStyle = "#468433"; // a slightly darker checker, so movement is readable
	g.fillRect(0, 0, size / 2, size / 2);
	g.fillRect(size / 2, size / 2, size / 2, size / 2);
	const tex = new THREE.CanvasTexture(c);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(GROUND_SIZE / TILE, GROUND_SIZE / TILE);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

export function createWorld(scene) {
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
		new THREE.MeshBasicMaterial({ map: tileTexture() })
	);
	ground.rotation.x = -Math.PI / 2;
	scene.add(ground);

	return {
		follow(x, z) { // snapped to whole tiles so the texture doesn't swim
			ground.position.set(Math.round(x / TILE) * TILE, 0, Math.round(z / TILE) * TILE);
		},
	};
}
