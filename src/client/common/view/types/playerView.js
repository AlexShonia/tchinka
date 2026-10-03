import { setupFacing, turnToward } from "../facing.js";
import { createKnight } from "../models.js";
import { settle } from "../settle.js";
import { BasicAttackState } from "../states/BasicAttackState.js";
import { JumpAttackState }  from "../states/JumpAttackState.js";
import { PLAYER_COMBAT, PLAYER_JUMP, toMs } from "../../../../shared/combatConfig.js";

const GLOW_HIT   = 0xff0000;
const GLOW_ARMED = 0x884400;
const CRITICAL_DURATION = 400;

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
		};
	}

	update(data) {
		this.x      = data.x;      this.z    = data.z;
		this.health = data.health; this.mana = data.mana; this.dead = data.dead;
		this.level  = data.level;  this.xp   = data.xp;   this.xpToNext = data.xpToNext;
		this.abilities = data.abilities ?? {};
		this.mesh.position.set(data.x, 0.5, data.z);
		this._facing = data.facing ?? 0;
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
		const hitElapsed = now - this._hitTime;
		const inCritical = hitElapsed >= 0 && hitElapsed < CRITICAL_DURATION;
		const armed = Object.values(this.abilities).some(a => a.armed);
		this.mesh.userData.glow(inCritical ? GLOW_HIT : armed ? GLOW_ARMED : 0);
	}

	remove() { this._scene.remove(this.mesh); }
}
