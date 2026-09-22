import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	90,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Top-down view: look down the Y axis onto the XZ plane
camera.position.set(0, 5, 10);
camera.up.set(0, 0, -1);
camera.lookAt(0, 0, 0);

const keys = new Set();
const speed = 0.1;
const projectiles = [];
const arrowSpeed = 0.3;
const volleyRange = 8;
const volleyCount = 5;
const volleySpread = Math.PI / 3; // 60° cone
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const mouseWorld = new THREE.Vector3();

window.addEventListener("keydown", (event) => {
	const key = event.key.toLowerCase();
	if (key === "2" && !keys.has("2")) {
		fireVolley();
	}
	keys.add(key);
});

window.addEventListener("keyup", (event) => {
	keys.delete(event.key.toLowerCase());
});

window.addEventListener("mousemove", (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	raycaster.ray.intersectPlane(ground, mouseWorld);
});

function shootArrow(landAt) {
	const arrow = new THREE.Mesh(
		new THREE.BoxGeometry(0.15, 0.15, 0.6),
		new THREE.MeshBasicMaterial({ color: 0xffaa00 }),
	);
	arrow.position.copy(cube.position);
	arrow.lookAt(landAt);
	scene.add(arrow);

	projectiles.push({
		mesh: arrow,
		target: landAt.clone(),
		landed: false,
		life: 60,
	});
}

function fireVolley() {
	const aim = mouseWorld.clone().setY(0).sub(cube.position);
	if (aim.lengthSq() === 0) aim.set(0, 0, -1);
	aim.normalize();

	const baseAngle = Math.atan2(aim.x, aim.z);

	for (let i = 0; i < volleyCount; i++) {
		const t = volleyCount === 1 ? 0.5 : i / (volleyCount - 1);
		const angle = baseAngle - volleySpread / 2 + t * volleySpread;
		const dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
		const landAt = cube.position.clone().add(dir.multiplyScalar(volleyRange));
		shootArrow(landAt);
	}
}

function animate() {
	if (keys.has("w")) cube.position.z -= speed;
	if (keys.has("s")) cube.position.z += speed;
	if (keys.has("a")) cube.position.x -= speed;
	if (keys.has("d")) cube.position.x += speed;

	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		if (!p.landed) {
			const toTarget = p.target.clone().sub(p.mesh.position);
			if (toTarget.length() <= arrowSpeed) {
				p.mesh.position.copy(p.target);
				p.landed = true;
			} else {
				p.mesh.position.add(toTarget.normalize().multiplyScalar(arrowSpeed));
			}
		} else {
			p.life -= 1;
			if (p.life <= 0) {
				scene.remove(p.mesh);
				projectiles.splice(i, 1);
			}
		}
	}

	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

renderer.domElement.addEventListener("click", (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const target = new THREE.Vector3();
	if (!raycaster.ray.intersectPlane(ground, target)) return;

	const landAt = target.clone().setY(0);
	if (landAt.distanceTo(cube.position) === 0) return;

	shootArrow(landAt);
});
