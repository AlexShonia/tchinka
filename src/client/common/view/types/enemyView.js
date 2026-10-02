import * as THREE from "three";
import { setupFacing, turnToward } from "../facing.js";
import { settle } from "../settle.js";
import { BasicAttackState } from "../states/BasicAttackState.js";
import { ENEMY_COMBAT, toMs } from "../../../../shared/combatConfig.js";

const enemyMat      = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const enemyHoverMat = new THREE.MeshBasicMaterial({ color: 0xff8855 });
const bgMat         = new THREE.MeshBasicMaterial({ color: 0x333333 });
const fillMat       = new THREE.MeshBasicMaterial({ color: 0xdd1111 });

const BAR_WIDTH = 1.0;
const BAR_Y     = 1.3;

export class EnemyView {
	constructor(scene) {
		this._scene  = scene;
		this._state  = "idle";
		this.x = 0; this.z = 0; this.hp = 1; this.maxHp = 1;

		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat);
		setupFacing(this.mesh);
		this._facing = 0;
		this._yaw    = 0;
		scene.add(this.mesh);
		this._states = {
			basicAttack: new BasicAttackState(toMs(ENEMY_COMBAT.windupTicks), toMs(ENEMY_COMBAT.attackTicks), this.mesh),
		};

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
		this._facing = data.facing ?? 0;
		this._barGroup.position.set(data.x, BAR_Y, data.z);

		if (data.state !== this._state) {
			this._state = data.state;
			const state = this._states[data.state];
			if (state) state.enter(data.attackSpeed ?? 1, this.targetEnemyId);
		}

		const damaged = data.hp < data.maxHp;
		this._barGroup.visible = damaged;
		if (damaged) {
			const r = data.hp / data.maxHp;
			this._fill.scale.x    = r;
			this._fill.position.x = (r - 1) / 2 * BAR_WIDTH;
		}
	}

	tick(now) {
		this._yaw = turnToward(this._yaw, this._facing);
		const state = this._states[this._state];
		if (state) state.apply();
		else settle(this.mesh);
		this.mesh.rotation.y = this._yaw + this.mesh.userData.swingYaw;
	}

	setHovered(on) {
		this.mesh.material = on ? enemyHoverMat : enemyMat;
	}

	remove() {
		this._scene.remove(this.mesh);
		this._scene.remove(this._barGroup);
	}
}
