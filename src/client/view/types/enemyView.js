import * as THREE from "three";

const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const bgMat    = new THREE.MeshBasicMaterial({ color: 0x333333 });
const fillMat  = new THREE.MeshBasicMaterial({ color: 0xdd1111 });

const BAR_WIDTH  = 1.0;
const BAR_HEIGHT = 0.08;
const BAR_DEPTH  = 0.08;
const BAR_Y      = 1.3;

export class EnemyView {
	constructor(scene) {
		this._scene = scene;

		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat);
		scene.add(this.mesh);

		this._barGroup = new THREE.Group();

		const bg = new THREE.Mesh(new THREE.BoxGeometry(BAR_WIDTH, BAR_HEIGHT, BAR_DEPTH), bgMat);
		this._barGroup.add(bg);

		this._fill = new THREE.Mesh(new THREE.BoxGeometry(BAR_WIDTH, BAR_HEIGHT, BAR_DEPTH), fillMat);
		this._barGroup.add(this._fill);

		this._barGroup.position.y = BAR_Y;
		this._barGroup.visible    = false;
		scene.add(this._barGroup);
	}

	sync(enemy) {
		this.mesh.position.set(enemy.x, 0.5, enemy.z);
		this._barGroup.position.set(enemy.x, BAR_Y, enemy.z);

		const damaged = enemy.hp < enemy.maxHp;
		this._barGroup.visible = damaged;
		if (damaged) {
			const r = enemy.hp / enemy.maxHp;
			this._fill.scale.x    = r;
			this._fill.position.x = (r - 1) / 2 * BAR_WIDTH;
		}
	}

	remove() {
		this._scene.remove(this.mesh);
		this._scene.remove(this._barGroup);
	}
}
