import * as THREE from "three";

const mat  = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const geom = new THREE.BoxGeometry(0.2, 0.2, 0.2);

export class ProjectileView {
	constructor(scene) {
		this._scene = scene;
		this.x = 0; this.z = 0;
		this.mesh = new THREE.Mesh(geom, mat);
		scene.add(this.mesh);
	}

	update(data) {
		this.x = data.x; this.z = data.z;
		this.mesh.position.set(data.x, 0.5, data.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
