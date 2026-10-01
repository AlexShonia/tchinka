import * as THREE from "three";
import { Player } from "./player.js";

const myMat    = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });

export class GameState {
	constructor(scene) {
		this.myId    = null;
		this.players = [];
		this.enemies = [];
		this._scene   = scene;
		this._instances = new Map(); // id -> Player
	}

	get localPlayer() { return this._instances.get(this.myId) ?? null; }

	applyWelcome(msg) { this.myId = msg.id; }

	applyState(msg) {
		this.players = msg.players;
		this.enemies = msg.enemies;

		const live = new Set(msg.players.map(p => p.id));
		for (const [id, p] of this._instances)
			if (!live.has(id)) { this._scene.remove(p.mesh); this._instances.delete(id); }

		for (const p of msg.players) {
			if (!this._instances.has(p.id)) {
				const instance = new Player(this._scene);
				instance.mesh.material = p.id === this.myId ? myMat : otherMat;
				this._instances.set(p.id, instance);
			}
			this._instances.get(p.id).position.set(p.x, 0.5, p.z);
		}
	}

	applyShoot(msg) {
		const player = this._instances.get(msg.id);
		player?.fireVolley(new THREE.Vector3(msg.x, 0, msg.z));
	}
}
