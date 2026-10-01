import * as THREE from "three";

const blockMat = new THREE.MeshBasicMaterial({ color: 0x888888 });

export class BlockView {
	constructor(scene) {
		this._scene = scene;
		this.mesh   = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), blockMat);
		scene.add(this.mesh);
	}

	sync(block) {
		this.mesh.position.set(block.x, 0.5, block.z);
	}

	remove() {
		this._scene.remove(this.mesh);
	}
}
