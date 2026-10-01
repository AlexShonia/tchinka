const PLAYER_SPEED  = 0.1;
const ENEMY_SPEED   = 0.05;
const PROJ_SPEED    = 0.3;
const PROJ_LIFE     = 120;
const VOLLEY_COUNT  = 5;
const VOLLEY_RANGE  = 8;
const VOLLEY_SPREAD = Math.PI / 3;

export class Service {
	constructor(gameData) {
		this._data = gameData;
	}

	addPlayer() {
		const id     = String(this._data.nextPlayerId++);
		const player = { id, x: 0, z: 0, moveTarget: null, isMoving: false };
		this._data.players.set(id, player);
		return player;
	}

	removePlayer(id) {
		this._data.players.delete(id);
	}

	movePlayer(player, x, z) {
		player.moveTarget = { x, z };
		player.isMoving   = true;
	}

	shoot(player, aimX, aimZ) {
		const dx        = aimX - player.x;
		const dz        = aimZ - player.z;
		const len       = Math.sqrt(dx * dx + dz * dz) || 1;
		const baseAngle = Math.atan2(dx / len, dz / len);

		for (let i = 0; i < VOLLEY_COUNT; i++) {
			const t     = VOLLEY_COUNT === 1 ? 0.5 : i / (VOLLEY_COUNT - 1);
			const angle = baseAngle - VOLLEY_SPREAD / 2 + t * VOLLEY_SPREAD;
			const dirX  = Math.sin(angle);
			const dirZ  = Math.cos(angle);
			const id    = String(this._data.nextProjId++);
			this._data.projectiles.set(id, {
				id,
				issuerId: player.id,
				x: player.x, z: player.z,
				toX: player.x + dirX * VOLLEY_RANGE,
				toZ: player.z + dirZ * VOLLEY_RANGE,
				dirX, dirZ,
				landed: false,
				life: PROJ_LIFE,
			});
		}
	}

	tick() {
		this._tickPlayers();
		this._tickEnemies();
		this._tickProjectiles();
	}

	_tickPlayers() {
		for (const p of this._data.players.values()) {
			if (!p.isMoving || !p.moveTarget) continue;
			const dx   = p.moveTarget.x - p.x;
			const dz   = p.moveTarget.z - p.z;
			const dist = Math.sqrt(dx * dx + dz * dz);
			if (dist <= PLAYER_SPEED) {
				p.x = p.moveTarget.x; p.z = p.moveTarget.z; p.isMoving = false;
			} else {
				p.x += (dx / dist) * PLAYER_SPEED;
				p.z += (dz / dist) * PLAYER_SPEED;
			}
		}
	}

	_tickEnemies() {
		const playerList = [...this._data.players.values()];
		if (playerList.length === 0) return;
		for (const e of this._data.enemies) {
			let nearest = playerList[0], nearestDist = Infinity;
			for (const p of playerList) {
				const d = Math.hypot(p.x - e.x, p.z - e.z);
				if (d < nearestDist) { nearestDist = d; nearest = p; }
			}
			const dx   = nearest.x - e.x;
			const dz   = nearest.z - e.z;
			const dist = Math.sqrt(dx * dx + dz * dz);
			if (dist > 0.1) { e.x += (dx / dist) * ENEMY_SPEED; e.z += (dz / dist) * ENEMY_SPEED; }
		}
	}

	_tickProjectiles() {
		for (const [id, p] of this._data.projectiles) {
			if (p.landed) {
				if (--p.life <= 0) this._data.projectiles.delete(id);
				continue;
			}
			const dx   = p.toX - p.x;
			const dz   = p.toZ - p.z;
			const dist = Math.sqrt(dx * dx + dz * dz);
			if (dist <= PROJ_SPEED) {
				p.x = p.toX; p.z = p.toZ; p.landed = true;
			} else {
				p.x += p.dirX * PROJ_SPEED;
				p.z += p.dirZ * PROJ_SPEED;
			}
		}
	}
}
