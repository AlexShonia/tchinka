import * as THREE from "three";
import { setupFacing, turnToward } from "../facing.js";
import { WindupState }   from "../states/WindupState.js";
import { HitState }      from "../states/HitState.js";
import { RecoveryState } from "../states/RecoveryState.js";
import { JumpWindupState } from "../states/JumpWindupState.js";
import { JumpAirState }    from "../states/JumpAirState.js";
import { JumpRecoveryState } from "../states/JumpRecoveryState.js";
import { PLAYER_COMBAT, PLAYER_JUMP, toMs } from "../../../../shared/combatConfig.js";

const myMat       = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat    = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const criticalMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const armedMat    = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });

const CRITICAL_DURATION = 400;

export class PlayerView {
	constructor(scene, isLocal) {
		this._scene   = scene;
		this._isLocal = isLocal;
		this._state   = "idle";
		this._hitTime = 0;
		this.x = 0; this.z = 0;
		this.health = 100; this.mana = 100; this.dead = false;
		this.abilities = {};
		this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), isLocal ? myMat : otherMat);
		setupFacing(this.mesh);
		this._facing = 0;
		this._yaw    = 0;
		scene.add(this.mesh);
		this._states = {
			windup:   new WindupState(toMs(PLAYER_COMBAT.windupTicks), this.mesh),
			hit:      new HitState(toMs(PLAYER_COMBAT.attackTicks), this.mesh),
			recovery: new RecoveryState(toMs(PLAYER_COMBAT.recoveryTicks), this.mesh),
			jumpWindup:    new JumpWindupState(toMs(PLAYER_JUMP.windupTicks), this.mesh),
			jumpAir:       new JumpAirState(toMs(PLAYER_JUMP.airTicks), this.mesh),
			jumpRecovery:  new JumpRecoveryState(toMs(PLAYER_COMBAT.recoveryTicks), this.mesh),
		};
	}

	update(data) {
		this.x      = data.x;      this.z    = data.z;
		this.health = data.health; this.mana = data.mana; this.dead = data.dead;
		this.abilities = data.abilities ?? {};
		this.mesh.position.set(data.x, 0.5, data.z);
		this._facing = data.facing ?? 0;
		if (data.hit) this._hitTime = performance.now();
		if (data.state !== this._state) {
			this._state = data.state;
			const state = this._states[data.state];
			if (state) state.enter(data.attackSpeed ?? 1, this.targetEnemyId);
		}
	}

	tick(now) {
		this._yaw = turnToward(this._yaw, this._facing);
		const state = this._states[this._state];
		if (state) state.apply();
		else { this.mesh.rotation.x = 0; this.mesh.rotation.z = 0; this.mesh.userData.swingYaw = 0; }
		this.mesh.rotation.y = this._yaw + this.mesh.userData.swingYaw;
		if (!state?.drivesScale) { // straighten out after a landing squash
			this.mesh.scale.y    += (1 - this.mesh.scale.y) * 0.2;
			this.mesh.position.y  = 0.5 * this.mesh.scale.y;
		}
		const hitElapsed = now - this._hitTime;
		const inCritical = hitElapsed >= 0 && hitElapsed < CRITICAL_DURATION;
		const armed = Object.values(this.abilities).some(a => a.armed);
		this.mesh.material = inCritical ? criticalMat : armed ? armedMat : (this._isLocal ? myMat : otherMat);
	}

	remove() { this._scene.remove(this.mesh); }
}
