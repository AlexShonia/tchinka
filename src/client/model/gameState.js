import { Player }     from "./player.js";
import { Enemy }      from "./enemies.js";
import { Projectile } from "./projectile.js";

export class GameState {
	constructor() {
		this.myId        = null;
		this._models     = new Map(); // id -> Player
		this._enemies    = new Map(); // id -> Enemy
		this.projectiles = new Map(); // id -> Projectile
		this.outbox      = [];        // outgoing messages, flushed each frame
	}

	get localPlayer() { return this._models.get(this.myId) ?? null; }

	applyWelcome(msg) { this.myId = msg.id; }

	applyState(msg) {
		this._syncModels(this._models,  msg.players,     () => new Player());
		this._syncModels(this._enemies, msg.enemies,     () => new Enemy());
		this._syncModels(this.projectiles, msg.projectiles, (item) => new Projectile(item.id, item.issuerId, { x: item.x, z: item.z }, { x: item.toX, z: item.toZ }));
	}

	localMove(x, z)  { this.outbox.push({ type: "move",  x, z }); }
	localShoot(x, z) { if (this.myId) this.outbox.push({ type: "shoot", x, z }); }

	_syncModels(map, items, create) {
		if (!items) return;
		const live = new Set(items.map(i => i.id));
		for (const id of map.keys())
			if (!live.has(id)) map.delete(id);
		for (const item of items) {
			if (!map.has(item.id)) map.set(item.id, create(item));
			const m = map.get(item.id);
			m.x = item.x; m.z = item.z;
		}
	}
}
