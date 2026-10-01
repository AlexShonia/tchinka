import * as THREE from "three";

const myMat    = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });

export class PlayerView {
	constructor(scene, isLocal) {
		this._scene = scene;
		this._prevX = null;
		this._prevZ = null;
		this.x = 0; this.z = 0;
		this.health = 100; this.mana = 100; this.dead = false;
		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), isLocal ? myMat : otherMat);
		scene.add(this.mesh);
	}

	update(data) {
		if (this._prevX !== null) {
			const dx = data.x - this._prevX, dz = data.z - this._prevZ;
			if (dx * dx + dz * dz > 0.00001)
				this.mesh.rotation.y = Math.atan2(dx, dz);
		}
		this._prevX   = data.x;    this._prevZ = data.z;
		this.x        = data.x;    this.z      = data.z;
		this.health   = data.health; this.mana = data.mana; this.dead = data.dead;
		this.mesh.position.set(data.x, 0.5, data.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
