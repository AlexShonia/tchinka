import { setupFacing, turnToward } from "../facing.js";
import { createKnight } from "../models.js";
import * as THREE from "three";
import { settle } from "../settle.js";
import { BasicAttackState } from "../states/BasicAttackState.js";
import { JumpAttackState }  from "../states/JumpAttackState.js";
import { ShoulderChargeState } from "../states/ShoulderChargeState.js";
import { SpinAttackState }     from "../states/SpinAttackState.js";
import { ShieldThrowState }    from "../states/ShieldThrowState.js";
import { PLAYER_COMBAT, PLAYER_JUMP, PLAYER_CHARGE, PLAYER_SHIELD, toMs } from "../../../../shared/combatConfig.js";

const GLOW_HIT   = 0xff0000;
const GLOW_ARMED = 0x884400;
const CRITICAL_DURATION = 400;

const shieldGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 14);
const shieldMaterial = new THREE.MeshLambertMaterial({ color: 0xd4a72c });

export class PlayerView {
	constructor(scene, isLocal) {
		this._scene   = scene;
		this._isLocal = isLocal;
		this._state   = "idle";
		this._hitTime = 0;
		this.x = 0; this.z = 0;
		this.health = 100; this.mana = 100; this.dead = false;
		this.level = 0; this.xp = 0; this.xpToNext = 1;
		this.abilities = {};
		this.mesh = createKnight(isLocal);
		setupFacing(this.mesh);
		this._facing = 0;
		this._yaw    = 0;
		scene.add(this.mesh);
		this._states = {
			basicAttack: new BasicAttackState(toMs(PLAYER_COMBAT.windupTicks), toMs(PLAYER_COMBAT.attackTicks), this.mesh),
			jumpAttack:  new JumpAttackState(toMs(PLAYER_JUMP.windupTicks), toMs(PLAYER_JUMP.airTicks), this.mesh),
			shoulderCharge: new ShoulderChargeState(toMs(PLAYER_CHARGE.windupTicks), this.mesh),
			spinAttack:     new SpinAttackState(this.mesh),
			shieldThrow:    new ShieldThrowState(toMs(PLAYER_SHIELD.windupTicks), this.mesh),
		};
		this._shield = new THREE.Mesh(shieldGeometry, shieldMaterial); // the thrown shield, only shown while it is out
		this._shield.visible = false;
		scene.add(this._shield);
	}

	update(data) {
		this.x      = data.x;      this.z    = data.z;
		this.health = data.health; this.mana = data.mana; this.dead = data.dead;
		this.level  = data.level;  this.xp   = data.xp;   this.xpToNext = data.xpToNext;
		this.abilities = data.abilities ?? {};
		this.mesh.position.set(data.x, 0.5, data.z);
		this._facing = data.facing ?? 0;
		this._shield.visible = !!data.shield;
		if (data.shield) this._shield.position.set(data.shield.x, 0.7, data.shield.z);
		if (data.hit) this._hitTime = performance.now();
		if (data.state !== this._state) {
			this._state = data.state;
			const state = this._states[data.state];
			if (state) { this._yaw = this._facing; state.enter(data.attackSpeed ?? 1, this.targetEnemyId); }
		}
	}

	tick(now) {
		const state = this._states[this._state];
		if (!state) this._yaw = turnToward(this._yaw, this._facing); // never turn while attacking, the swing starts already facing the target
		if (state) state.apply();
		else settle(this.mesh);
		this.mesh.rotation.y = this._yaw + this.mesh.userData.swingYaw;
		if (!state?.drivesScale) { // straighten out after a landing squash
			this.mesh.scale.y    += (1 - this.mesh.scale.y) * 0.2;
			this.mesh.position.y  = 0.5 * this.mesh.scale.y;
		}
		if (this._shield.visible) this._shield.rotation.y = now * 0.03;
		const hitElapsed = now - this._hitTime;
		const inCritical = hitElapsed >= 0 && hitElapsed < CRITICAL_DURATION;
		const armed = Object.values(this.abilities).some(a => a.armed);
		this.mesh.userData.glow(inCritical ? GLOW_HIT : armed ? GLOW_ARMED : 0);
	}

	remove() {
		this._scene.remove(this.mesh);
		this._scene.remove(this._shield);
	}
}
