import * as THREE from "three";

const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const bgMat    = new THREE.MeshBasicMaterial({ color: 0x333333 });
const fillMat  = new THREE.MeshBasicMaterial({ color: 0xdd1111 });

const BAR_WIDTH = 1.0;
const BAR_Y     = 1.3;

export class EnemyView {
	constructor(scene) {
		this._scene = scene;
		this.x = 0; this.z = 0; this.hp = 1; this.maxHp = 1;

		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat);
		scene.add(this.mesh);

		this._barGroup = new THREE.Group();
		this._barGroup.add(new THREE.Mesh(new THREE.BoxGeometry(BAR_WIDTH, 0.08, 0.08), bgMat));
		this._fill = new THREE.Mesh(new THREE.BoxGeometry(BAR_WIDTH, 0.08, 0.08), fillMat);
		this._barGroup.add(this._fill);
		this._barGroup.visible = false;
		scene.add(this._barGroup);
	}

	update(data) {
		this.x = data.x; this.z = data.z; this.hp = data.hp; this.maxHp = data.maxHp;
		this.mesh.position.set(data.x, 0.5, data.z);
		this._barGroup.position.set(data.x, BAR_Y, data.z);

		const damaged = data.hp < data.maxHp;
		this._barGroup.visible = damaged;
		if (damaged) {
			const r = data.hp / data.maxHp;
			this._fill.scale.x    = r;
			this._fill.position.x = (r - 1) / 2 * BAR_WIDTH;
		}
	}

	remove() {
		this._scene.remove(this.mesh);
		this._scene.remove(this._barGroup);
	}
}
