export class Entity {
	constructor() {
		this.x = 0;
		this.z = 0;
		this.facing = 0; // yaw for three.js rotation.y: 0 faces +z, atan2(dx, dz) points at (dx, dz)
	}
}
