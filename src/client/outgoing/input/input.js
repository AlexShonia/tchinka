export function setupInput(service, domElement) {
	let mouseX = 0, mouseY = 0;

	window.addEventListener("mousemove", (event) => {
		mouseX = event.clientX;
		mouseY = event.clientY;
	});

	domElement.addEventListener("click", (event) => {
		service.localMove(event.clientX, event.clientY);
	});

	window.addEventListener("keydown", (event) => {
		if (event.key !== "1") return;
		service.localShoot(mouseX, mouseY);
	});
}
