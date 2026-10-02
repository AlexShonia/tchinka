import * as THREE from "three";

const myMat       = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat    = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const criticalMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const ATTACK_DURATION   = 300;
const CRITICAL_DURATION = 400;

export class PlayerView {
	constructor(scene, isLocal) {
		this._scene       = scene;
		this._isLocal     = isLocal;
		this._attackStart       = 0;
		this._serverAttackStart = 0;
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
		if (data.attackStart && data.attackStart !== this._serverAttackStart) {
			this._serverAttackStart = data.attackStart;
			this._attackStart       = performance.now();
		}
	}

	tick(now) {
		const attackElapsed = now - this._attackStart;
		const hitElapsed    = now - this._hitTime;

		this.mesh.rotation.z = (attackElapsed >= 0 && attackElapsed < ATTACK_DURATION)
			? Math.sin(attackElapsed / ATTACK_DURATION * Math.PI) * 0.4
			: 0;

		const inCritical = hitElapsed >= 0 && hitElapsed < CRITICAL_DURATION;
		this.mesh.material = inCritical ? criticalMat : (this._isLocal ? myMat : otherMat);
	}

	remove() { this._scene.remove(this.mesh); }
}
