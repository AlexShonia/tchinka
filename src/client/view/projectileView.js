import * as THREE from "three";

const mat    = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const _lookAt = new THREE.Vector3();

export class ProjectileView {
	constructor(scene, projectile) {
		this._scene = scene;
		this.mesh   = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.6), mat);
		_lookAt.set(projectile.toX, 0.5, projectile.toZ);
		this.mesh.lookAt(_lookAt);
		scene.add(this.mesh);
	}

	sync(projectile) {
		this.mesh.position.set(projectile.x, 0.5, projectile.z);
	}

	remove() { this._scene.remove(this.mesh); }
}
