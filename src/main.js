import { World }      from "./model/world.js";
import { Connection } from "./connection/connection.js";
import { GameState }  from "./model/game.js";
import { Display }    from "./view/display.js";
import { setupInput } from "./controller/input.js";

const SERVER = `ws://${location.hostname}:1234`;

const world   = new World();
const game    = new GameState(world.scene);
const display = new Display(world.scene, world.camera);
const conn    = new Connection(SERVER, game);

setupInput(world, conn, game);

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
