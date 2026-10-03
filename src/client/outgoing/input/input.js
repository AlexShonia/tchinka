import * as THREE from "three";

const _raycaster = new THREE.Raycaster();
const _mouse     = new THREE.Vector2();

export class InputController {
	constructor(service, domElement, camera, getEnemies) {
		this._service    = service;
		this._camera     = camera;
		this._getEnemies = getEnemies;
		this._hovered    = null;

		window.addEventListener("mousemove", (e) => {
			_mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
			_mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
		});

		window.addEventListener("keydown", (e) => {
			if (e.code === "KeyQ" && !e.repeat) service.useAbility("q");
			if (e.code === "KeyA" && !e.repeat) service.attackNearest();
		});

		domElement.addEventListener("click", (e) => {
			if (this._hovered) {
				service.attackEnemy(this._hovered.id);
			} else {
				service.localMove(e.clientX, e.clientY);
			}
		});
	}

	// TODO: this shouldnt be in here should be out in tick.js on client
	tick() {
		_raycaster.setFromCamera(_mouse, this._camera);
		const views = [...this._getEnemies()];
		const hit   = _raycaster.intersectObjects(views.map(v => v.mesh), true)[0]; // models are groups of parts
		let owner   = hit?.object;
		while (owner && !views.some(v => v.mesh === owner)) owner = owner.parent;
		const next  = owner ? views.find(v => v.mesh === owner) : null;
		if (next !== this._hovered) {
			this._hovered?.setHovered(false);
			next?.setHovered(true);
			this._hovered = next;
		}
	}
}
