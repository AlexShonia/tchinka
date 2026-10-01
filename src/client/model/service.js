import * as THREE from "three";

const _raycaster = new THREE.Raycaster();
const _mouse     = new THREE.Vector2();
const _ground    = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function screenToWorld(clientX, clientY, camera, target) {
	_mouse.x = (clientX / window.innerWidth)  *  2 - 1;
	_mouse.y = (clientY / window.innerHeight) * -2 + 1;
	_raycaster.setFromCamera(_mouse, camera);
	return _raycaster.ray.intersectPlane(_ground, target);
}

export class Service {
	constructor(camera, gameState) {
		this._camera    = camera;
		this._gameState = gameState;
		this.outbox     = [];
	}

	localMove(screenX, screenY) {
		const target = new THREE.Vector3();
		if (!screenToWorld(screenX, screenY, this._camera, target)) return;
		this.outbox.push({ type: "move", x: target.x, z: target.z });
	}

	localShoot(screenX, screenY) {
		if (!this._gameState.myId) return;
		const target = new THREE.Vector3();
		if (!screenToWorld(screenX, screenY, this._camera, target)) return;
		this.outbox.push({ type: "shoot", x: target.x, z: target.z });
	}
}
