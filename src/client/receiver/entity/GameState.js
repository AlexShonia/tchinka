import { PlayerView }     from "./view/types/playerView.js";
import { EnemyView }      from "./view/types/enemyView.js";
import { ProjectileView } from "./view/types/projectileView.js";
import { BlockView }      from "./view/types/blockView.js";

export class GameState {
	constructor(scene, hud) {
		this._scene      = scene;
		this._hud        = hud;
		this.myId        = null;
		this.wave        = 1;
		this.players     = new Map();
		this.enemies     = new Map();
		this.projectiles = new Map();
		this.blocks      = new Map();
	}

	get localPlayer() { return this.players.get(this.myId) ?? null; }

	applyWelcome(msg) {
		this.myId = msg.id;
		for (const b of msg.blocks) {
			const view = new BlockView(this._scene);
			view.update(b);
			this.blocks.set(b.id, view);
		}
	}

	applyState(msg) {
		this.wave = msg.wave;
		this._sync(this.players,     msg.players,     (d) => new PlayerView(this._scene, d.id === this.myId));
		this._sync(this.enemies,     msg.enemies,     ()  => new EnemyView(this._scene));
		this._sync(this.projectiles, msg.projectiles, ()  => new ProjectileView(this._scene));
		this._hud.update(this.localPlayer, this.wave);
	}

	_sync(map, items, create) {
		if (!items) return;
		const live = new Set(items.map(i => i.id));
		for (const [id, view] of map)
			if (!live.has(id)) { view.remove(); map.delete(id); }
		for (const item of items) {
			if (!map.has(item.id)) map.set(item.id, create(item));
			map.get(item.id).update(item);
		}
	}
}
