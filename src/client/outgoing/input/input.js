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

		domElement.addEventListener("click", (e) => {
			if (this._hovered) {
				service.attackEnemy(this._hovered.id);
			} else {
				service.localMove(e.clientX, e.clientY);
			}
		});
	}

	tick() {
		_raycaster.setFromCamera(_mouse, this._camera);
		const views = [...this._getEnemies()];
		const hit   = _raycaster.intersectObjects(views.map(v => v.mesh))[0];
		const next  = hit ? views.find(v => v.mesh === hit.object) : null;
		if (next !== this._hovered) {
			this._hovered?.setHovered(false);
			next?.setHovered(true);
			this._hovered = next;
		}
	}
}
