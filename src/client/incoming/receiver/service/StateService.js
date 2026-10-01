import { PlayerView }     from "../../common/view/types/playerView.js";
import { EnemyView }      from "../../common/view/types/enemyView.js";
import { ProjectileView } from "../../common/view/types/projectileView.js";
import { BlockView }      from "../../common/view/types/blockView.js";

export class StateService {
	constructor(gameState, scene, hud) {
		this._gameState = gameState;
		this._scene     = scene;
		this._hud       = hud;
	}

	applyWelcome(msg) {
		this._gameState.myId = msg.id;
		for (const b of msg.blocks) {
			const view = new BlockView(this._scene);
			view.update(b);
			this._gameState.blocks.set(b.id, view);
		}
	}

	applyState(msg) {
		this._gameState.wave = msg.wave;
		this._sync(this._gameState.players,     msg.players,     (d) => new PlayerView(this._scene, d.id === this._gameState.myId));
		this._sync(this._gameState.enemies,     msg.enemies,     ()  => new EnemyView(this._scene));
		this._sync(this._gameState.projectiles, msg.projectiles, ()  => new ProjectileView(this._scene));
		this._hud.update(this._gameState.localPlayer, this._gameState.wave);
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
