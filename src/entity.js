export class Entity {
	constructor(scene, mesh) {
		this.scene = scene;
		this.mesh = mesh;
		this.speed = 0.1;
		scene.add(mesh);
	}

	get position() {
		return this.mesh.position;
	}

	update() {}
}
