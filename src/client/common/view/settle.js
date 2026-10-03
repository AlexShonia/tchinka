const RELAX = 0.8; // share of the pose kept each frame while no attack animation is playing

// eases the attack poses back to rest, so recovery needs no animation of its own
export function settle(mesh) {
	mesh.rotation.x       *= RELAX;
	mesh.rotation.z       *= RELAX;
	mesh.userData.swingYaw *= RELAX;
}

// a new attack animation starts from a neutral pose, never from whatever the last one was still easing back from
export function resetPose(mesh) {
	mesh.rotation.x        = 0;
	mesh.rotation.z        = 0;
	mesh.userData.swingYaw = 0;
}
