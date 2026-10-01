import * as THREE from "three";

export class PlayerView {
	constructor(scene, material) {
		this._scene  = scene;
		this._prevX  = null;
		this._prevZ  = null;
		this.mesh    = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
		scene.add(this.mesh);
	}

	sync(player) {
		if (this._prevX !== null) {
			const dx = player.x - this._prevX;
			const dz = player.z - this._prevZ;
			if (dx * dx + dz * dz > 0.00001)
				this.mesh.rotation.y = Math.atan2(dx, dz);
		}
		this._prevX = player.x;
		this._prevZ = player.z;
		this.mesh.position.set(player.x, 0.5, player.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
