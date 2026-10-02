import * as THREE from "three";
import { WindupState }   from "../states/WindupState.js";
import { AttackState }   from "../states/AttackState.js";
import { RecoveryState } from "../states/RecoveryState.js";

const enemyMat      = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const enemyHoverMat = new THREE.MeshBasicMaterial({ color: 0xff8855 });
const bgMat         = new THREE.MeshBasicMaterial({ color: 0x333333 });
const fillMat       = new THREE.MeshBasicMaterial({ color: 0xdd1111 });

const BAR_WIDTH = 1.0;
const BAR_Y     = 1.3;

const windup   = new WindupState(280);
const attack   = new AttackState(120);
const recovery = new RecoveryState(400);
const STATES   = { windup, attack, recovery };

export class EnemyView {
	constructor(scene) {
		this._scene             = scene;
		this._serverAttackStart = 0;
		this._attackStart       = 0;
		this._attackState       = null;
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
		this.id = data.id;
		this.x = data.x; this.z = data.z; this.hp = data.hp; this.maxHp = data.maxHp;
		this.mesh.position.set(data.x, 0.5, data.z);
		this._barGroup.position.set(data.x, BAR_Y, data.z);

		if (data.attackStart && data.attackStart !== this._serverAttackStart) {
			this._serverAttackStart = data.attackStart;
			this._attackStart       = performance.now();
		}
		this._attackState = data.state;

		const damaged = data.hp < data.maxHp;
		this._barGroup.visible = damaged;
		if (damaged) {
			const r = data.hp / data.maxHp;
			this._fill.scale.x    = r;
			this._fill.position.x = (r - 1) / 2 * BAR_WIDTH;
		}
	}

	tick(now) {
		const state = STATES[this._attackState];
		if (state) state.apply(this.mesh, now - this._attackStart);
		else this.mesh.rotation.z = 0;
	}

	setHovered(on) {
		this.mesh.material = on ? enemyHoverMat : enemyMat;
	}

	remove() {
		this._scene.remove(this.mesh);
		this._scene.remove(this._barGroup);
	}
}
