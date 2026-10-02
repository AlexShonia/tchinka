import * as THREE from "three";
import { WindupState }   from "../states/WindupState.js";
import { AttackState }   from "../states/AttackState.js";
import { RecoveryState } from "../states/RecoveryState.js";
import { PLAYER_COMBAT, toMs } from "../../../../shared/combatConfig.js";

const myMat       = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat    = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const criticalMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const CRITICAL_DURATION = 400;

const windup   = new WindupState(toMs(PLAYER_COMBAT.windupTicks));
const attack   = new AttackState(toMs(PLAYER_COMBAT.attackTicks));
const recovery = new RecoveryState(toMs(PLAYER_COMBAT.recoveryTicks));
const STATES   = { windup, attack, recovery };

export class PlayerView {
	constructor(scene, isLocal) {
		this._scene       = scene;
		this._isLocal     = isLocal;
		this._serverAttackStart = 0;
		this._attackState       = null;
		this._stateStart        = 0;
		this._attackSpeed       = 1;
		this._hitTime           = 0;
		this.x = 0; this.z = 0;
		this.health = 100; this.mana = 100; this.dead = false;
		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), isLocal ? myMat : otherMat);
		scene.add(this.mesh);
	}

	update(data) {
		this.x      = data.x;      this.z    = data.z;
		this.health = data.health; this.mana = data.mana; this.dead = data.dead;
		this.mesh.position.set(data.x, 0.5, data.z);
		if (data.hit) this._hitTime = performance.now();
		if (data.state !== this._attackState) {
			this._stateStart  = performance.now();
			this._attackState = data.state;
		}
		if (data.attackStart !== this._serverAttackStart) {
			this._serverAttackStart = data.attackStart;
		}
		this._attackSpeed = data.attackSpeed ?? 1;
	}

	tick(now) {
		const hitElapsed = now - this._hitTime;
		const state = STATES[this._attackState];
		if (state) state.apply(this.mesh, now - this._stateStart, this._attackSpeed);
		else this.mesh.rotation.z = 0;
		const inCritical = hitElapsed >= 0 && hitElapsed < CRITICAL_DURATION;
		this.mesh.material = inCritical ? criticalMat : (this._isLocal ? myMat : otherMat);
	}

	remove() { this._scene.remove(this.mesh); }
}
