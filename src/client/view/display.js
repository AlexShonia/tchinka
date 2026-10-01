import * as THREE from "three";
import { PlayerView }     from "./types/playerView.js";
import { EnemyView }      from "./types/enemyView.js";
import { ProjectileView } from "./types/projectileView.js";
import { BlockView }      from "./types/blockView.js";
import { Hud }            from "./types/Hud.js";

const myMat    = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const otherMat = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });

const CAM_OFFSET = new THREE.Vector3(0, 8, 5);

export class Display {
	constructor(scene, camera) {
		this._scene           = scene;
		this._camera          = camera;
		this._playerViews     = new Map();
		this._enemyViews      = new Map();
		this._projectileViews = new Map();
		this._blockViews      = new Map();
		this._hud             = new Hud();
	}

	update(game) {
		this._syncViews(this._playerViews,     game._models,     id => new PlayerView(this._scene, id === game.myId ? myMat : otherMat));
		this._syncViews(this._enemyViews,      game._enemies,    () => new EnemyView(this._scene));
		this._syncViews(this._projectileViews, game.projectiles, () => new ProjectileView(this._scene));
		this._syncViews(this._blockViews,      game.blocks,      () => new BlockView(this._scene));
		this._hud.update(game.localPlayer, game.wave);
		this._followMyPlayer(game);
	}

	_syncViews(views, models, create) {
		for (const [id, view] of views)
			if (!models.has(id)) { view.remove(); views.delete(id); }
		for (const [id, model] of models) {
			if (!views.has(id)) views.set(id, create(id));
			views.get(id).sync(model);
		}
	}

	_followMyPlayer(game) {
		const p = game.localPlayer;
		if (!p) return;
		this._camera.position.set(p.x + CAM_OFFSET.x, CAM_OFFSET.y, p.z + CAM_OFFSET.z);
		this._camera.lookAt(p.x, 0, p.z);
	}
}
