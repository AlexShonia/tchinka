import * as THREE from "three";

export class PlayerView {
	constructor(scene, material) {
		this._scene = scene;
		this.mesh   = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
		scene.add(this.mesh);
	}

	sync(player) {
		this.mesh.position.set(player.x, 0.5, player.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
