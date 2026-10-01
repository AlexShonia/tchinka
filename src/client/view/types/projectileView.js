import * as THREE from "three";

const mat  = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const geom = new THREE.BoxGeometry(0.2, 0.2, 0.2);

export class ProjectileView {
	constructor(scene) {
		this._scene = scene;
		this.mesh   = new THREE.Mesh(geom, mat);
		scene.add(this.mesh);
	}

	sync(projectile) {
		this.mesh.position.set(projectile.x, 0.5, projectile.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
