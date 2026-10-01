import * as THREE from "three";
import { Entity } from "./entity.js";

export class Player extends Entity {
	constructor(scene) {
		const mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshBasicMaterial({
				color: 0x0ffff0,
				wireframe: true,
			}),
		);
		super(scene, mesh);

		this.moveTarget = new THREE.Vector3();
		this.isMoving = false;
		this.cameraOffset = new THREE.Vector3(0, 5, 5);
		this.projectiles = [];
		this.arrowSpeed = 0.3;
		this.volleyRange = 8;
		this.volleyCount = 5;
		this.volleySpread = Math.PI / 3; // 60° cone
	}

	setMoveTarget(point) {
		this.moveTarget.copy(point).setY(0);
		this.isMoving = true;
	}

	fireVolley(aimPoint) {
		const aim = aimPoint.clone().setY(0).sub(this.position);
		if (aim.lengthSq() === 0) aim.set(0, 0, -1);
		aim.normalize();

		const baseAngle = Math.atan2(aim.x, aim.z);

		for (let i = 0; i < this.volleyCount; i++) {
			const t = this.volleyCount === 1 ? 0.5 : i / (this.volleyCount - 1);
			const angle = baseAngle - this.volleySpread / 2 + t * this.volleySpread;
			const dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
			const landAt = this.position.clone().add(dir.multiplyScalar(this.volleyRange));
			this.shootArrow(landAt);
		}
	}

	shootArrow(landAt) {
		const arrow = new THREE.Mesh(
			new THREE.BoxGeometry(0.15, 0.15, 0.6),
			new THREE.MeshBasicMaterial({ color: 0xffaa00 }),
		);
		arrow.position.copy(this.position);
		arrow.lookAt(landAt);
		this.scene.add(arrow);

		this.projectiles.push({
			mesh: arrow,
			target: landAt.clone(),
			landed: false,
			life: 60,
		});
	}

	update(camera) {
		if (this.isMoving) {
			const toTarget = this.moveTarget.clone().sub(this.position);
			toTarget.y = 0;
			if (toTarget.length() <= this.speed) {
				this.position.x = this.moveTarget.x;
				this.position.z = this.moveTarget.z;
				this.isMoving = false;
			} else {
				toTarget.normalize().multiplyScalar(this.speed);
				this.position.add(toTarget);
			}
			camera.position.copy(this.position).add(this.cameraOffset);
		}

		this.updateProjectiles();
	}

	updateProjectiles() {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const projectile = this.projectiles[i];
			if (!projectile.landed) {
				const toTarget = projectile.target.clone().sub(projectile.mesh.position);
				if (toTarget.length() <= this.arrowSpeed) {
					projectile.mesh.position.copy(projectile.target);
					projectile.landed = true;
				} else {
					projectile.mesh.position.add(
						toTarget.normalize().multiplyScalar(this.arrowSpeed),
					);
				}
			} else {
				projectile.life -= 1;
				if (projectile.life <= 0) {
					this.scene.remove(projectile.mesh);
					this.projectiles.splice(i, 1);
				}
			}
		}
	}
}
