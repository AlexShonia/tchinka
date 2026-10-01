import { Player }     from "../Player.js";
import { Enemy }      from "./Enemy.js";
import { Projectile } from "./Projectile.js";
import { Block }      from "./Block.js";

export class GameState {
	constructor() {
		this.myId        = null;
		this.wave        = 1;
		this._models     = new Map();
		this._enemies    = new Map();
		this.projectiles = new Map();
		this.blocks      = new Map();
	}

	get localPlayer() { return this._models.get(this.myId) ?? null; }

	applyWelcome(msg) {
		this.myId = msg.id;
		for (const b of msg.blocks) this.blocks.set(b.id, new Block(b.id, b.x, b.z));
	}

	applyState(msg) {
		this.wave = msg.wave;
		this._syncModels(this._models,     msg.players,     () => new Player());
		this._syncModels(this._enemies,    msg.enemies,     () => new Enemy());
		this._syncModels(this.projectiles, msg.projectiles, (item) => new Projectile(item.id, item.issuerId, { x: item.x, z: item.z }, { x: item.toX, z: item.toZ }));
	}

	_syncModels(map, items, create) {
		if (!items) return;
		const live = new Set(items.map(i => i.id));
		for (const id of map.keys())
			if (!live.has(id)) map.delete(id);
		for (const item of items) {
			if (!map.has(item.id)) map.set(item.id, create(item));
			const m = map.get(item.id);
			for (const key of Object.keys(item))
				if (key !== "id") m[key] = item[key];
		}
	}
}
