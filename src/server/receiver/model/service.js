import { Player }     from "./entity/types/Player.js";
import { Projectile } from "./entity/types/Projectile.js";

const MANA_COST_SHOOT = 25;
const VOLLEY_COUNT    = 1;
const VOLLEY_RANGE    = 8;
const VOLLEY_SPREAD   = Math.PI / 3;
const PROJ_LIFE       = 120;

export class Service {
	constructor(gameData) {
		this._gameData = gameData;
	}

	addPlayer() {
		const id     = String(this._gameData.nextPlayerId++);
		const player = new Player(id);
		this._gameData.players.set(id, player);
		return player;
	}

	removePlayer(id) {
		this._gameData.players.delete(id);
	}

	movePlayer(player, x, z) {
		if (player.dead) return;
		player.moveTarget = { x, z };
		player.isMoving   = true;
	}

	shoot(player, aimX, aimZ) {
		if (player.dead || player.mana < MANA_COST_SHOOT) return;
		player.mana -= MANA_COST_SHOOT;

		const dx        = aimX - player.x;
		const dz        = aimZ - player.z;
		const len       = Math.sqrt(dx * dx + dz * dz) || 1;
		const baseAngle = Math.atan2(dx / len, dz / len);

		for (let i = 0; i < VOLLEY_COUNT; i++) {
			const t     = VOLLEY_COUNT === 1 ? 0.5 : i / (VOLLEY_COUNT - 1);
			const angle = baseAngle - VOLLEY_SPREAD / 2 + t * VOLLEY_SPREAD;
			const dirX  = Math.sin(angle);
			const dirZ  = Math.cos(angle);
			const id    = String(this._gameData.nextProjId++);
			const toX   = player.x + dirX * VOLLEY_RANGE;
			const toZ   = player.z + dirZ * VOLLEY_RANGE;
			this._gameData.projectiles.set(id, new Projectile(id, player.id, player.x, player.z, toX, toZ, dirX, dirZ, PROJ_LIFE));
		}
	}
}
