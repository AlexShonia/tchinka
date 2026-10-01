import * as THREE from "three";

const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });

export class EnemyView {
	constructor(scene) {
		this._scene = scene;
		this.mesh   = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat);
		scene.add(this.mesh);
	}

	sync(enemy) {
		this.mesh.position.set(enemy.x, 0.5, enemy.z);
	}

	remove() {
		this._scene.remove(this.mesh);
	}
}
