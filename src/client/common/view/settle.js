const RELAX = 0.8; // share of the pose kept each frame while no attack animation is playing

// eases the attack poses back to rest, so recovery needs no animation of its own
export function settle(mesh) {
	mesh.rotation.x       *= RELAX;
	mesh.rotation.z       *= RELAX;
	mesh.userData.swingYaw *= RELAX;
}
