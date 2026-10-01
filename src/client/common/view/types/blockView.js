import * as THREE from "three";

const blockMat = new THREE.MeshBasicMaterial({ color: 0x888888 });

export class BlockView {
	constructor(scene) {
		this._scene = scene;
		this.x = 0; this.z = 0;
		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), blockMat);
		scene.add(this.mesh);
	}

	update(data) {
		this.x = data.x; this.z = data.z;
		this.mesh.position.set(data.x, 0.5, data.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
