export function setupInput(gameState, domElement) {
	let mouseX = 0, mouseY = 0;

	window.addEventListener("mousemove", (event) => {
		mouseX = event.clientX;
		mouseY = event.clientY;
	});

	domElement.addEventListener("click", (event) => {
		gameState.localMove(event.clientX, event.clientY);
	});

	window.addEventListener("keydown", (event) => {
		if (event.key !== "1") return;
		gameState.localShoot(mouseX, mouseY);
	});
}
