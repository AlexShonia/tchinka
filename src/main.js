import { World }      from "./world.js";
import { Connection } from "./connection.js";
import { GameState }  from "./game.js";
import { Display }    from "./display.js";
import { setupInput } from "./input.js";

const SERVER = `ws://${location.hostname}:1234`;

const world   = new World();
const game    = new GameState();
const display = new Display(world.scene, world.camera);
const conn    = new Connection(SERVER, game);

setupInput(world, conn);

// ── render loop ───────────────────────────────────────────────────────────────
const perfEl = document.getElementById("perf");
let frameCount = 0, fps = 0, prevNow = 0;

world.renderer.setAnimationLoop((now) => {
	frameCount++;
	if (frameCount % 10 === 0) fps = Math.round(1000 / (now - (prevNow || now)));
	prevNow = now;
	perfEl.textContent = `${fps} fps  ${(1000 / (fps || 1)).toFixed(1)} ms`;

	display.update(game);
	world.renderer.render(world.scene, world.camera);
});
