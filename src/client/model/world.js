import * as THREE from "three";

const blockPositions = [
	[3, 0.5, -2],
	[-4, 0.5, 1],
	[2, 0.5, 4],
	[-2, 0.5, -5],
	[5, 0.5, 2],
];

export class World {
	constructor() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			90,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		// Top-down view: look down the Y axis onto the XZ plane
		this.camera.position.set(0, 5, 5);
		this.camera.up.set(0, 0, -1);
		this.camera.lookAt(0, 0, 0);

		this.ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.addBlocks();
	}

	addBlocks() {
		const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
		for (const [x, y, z] of blockPositions) {
			const block = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
			block.position.set(x, y, z);
			this.scene.add(block);
		}
	}

	pointerOnGround(clientX, clientY, target) {
		this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
		this.raycaster.setFromCamera(this.mouse, this.camera);
		return this.raycaster.ray.intersectPlane(this.ground, target);
	}
}
