export class GameData {
	constructor() {
		this.players     = new Map();
		this.projectiles = new Map();
		this.enemies     = Array.from({ length: 5 }, (_, i) => ({
			id: `e${i}`,
			x: (Math.random() - 0.5) * 20,
			z: (Math.random() - 0.5) * 20,
		}));
		this.blocks = [
			{ id: "b0", x:  3, z: -2 },
			{ id: "b1", x: -4, z:  1 },
			{ id: "b2", x:  2, z:  4 },
			{ id: "b3", x: -2, z: -5 },
			{ id: "b4", x:  5, z:  2 },
		];
		this.nextPlayerId = 1;
		this.nextProjId   = 0;
	}
}
