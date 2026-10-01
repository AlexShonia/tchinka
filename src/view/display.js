import * as THREE from "three";

const playerMat   = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const myPlayerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const enemyMat    = new THREE.MeshBasicMaterial({ color: 0xff3333 });

const CAM_OFFSET = new THREE.Vector3(0, 5, 5);

export class Display {
	constructor(scene, camera) {
		this._scene   = scene;
		this._camera  = camera;
		this._players = new Map(); // id -> Mesh
		this._enemies = new Map(); // id -> Mesh
	}

	update(game) {
		this._sync(this._players, game.players, () =>
			new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), playerMat));

		this._sync(this._enemies, game.enemies, () =>
			new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMat));

		for (const p of game.players) {
			const mesh = this._players.get(p.id);
			mesh.material = p.id === game.myId ? myPlayerMat : playerMat;
			mesh.position.set(p.x, 0.5, p.z);
		}

		for (const e of game.enemies)
			this._enemies.get(e.id).position.set(e.x, 0.5, e.z);

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
		if (!game.myId) return;
		const me = game.players.find(p => p.id === game.myId);
		if (!me) return;
		this._camera.position.set(me.x + CAM_OFFSET.x, CAM_OFFSET.y, me.z + CAM_OFFSET.z);
		this._camera.lookAt(me.x, 0, me.z);
	}
}
