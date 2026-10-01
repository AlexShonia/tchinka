import * as THREE from "three";

const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const CAM_OFFSET = new THREE.Vector3(0, 8, 5);

export class Display {
	constructor(scene, camera) {
		this._scene   = scene;
		this._camera  = camera;
		this._enemies = new Map(); // id -> Mesh
	}

	update(game) {
		this._sync(this._enemies, game.enemies, () =>
			new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat));

		for (const e of game.enemies)
			this._enemies.get(e.id).position.set(e.x, 0.5, e.z);

		for (const player of game._instances.values())
			player.updateProjectiles();

		this._followMyPlayer(game);
	}

	_sync(map, items, create) {
		const live = new Set(items.map(i => i.id));
		for (const [id, mesh] of map)
			if (!live.has(id)) { this._scene.remove(mesh); map.delete(id); }
		for (const item of items)
			if (!map.has(item.id)) { const m = create(); this._scene.add(m); map.set(item.id, m); }
	}

	_followMyPlayer(game) {
		const p = game.localPlayer;
		if (!p) return;
		this._camera.position.set(p.position.x + CAM_OFFSET.x, CAM_OFFSET.y, p.position.z + CAM_OFFSET.z);
		this._camera.lookAt(p.position.x, 0, p.position.z);
	}
}
