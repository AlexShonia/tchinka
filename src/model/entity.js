export class Entity {
	constructor(scene, mesh) {
		this.scene = scene;
		this.mesh = mesh;
		this.speed = 2;
		scene.add(mesh);
	}

	get position() {
		return this.mesh.position;
	}

	update() {}
}
