// yaw first, so the Q tilts (rotation.x) are always relative to where the mesh faces
export function setupFacing(mesh) {
	mesh.rotation.order = "YXZ";
	mesh.userData.swingYaw = 0; // extra yaw on top of the facing, written by the attack animations
}

// moves `yaw` a fraction of the way toward `target`, the shortest way round
export function turnToward(yaw, target, rate = 0.25) {
	return yaw + Math.atan2(Math.sin(target - yaw), Math.cos(target - yaw)) * rate;
}
