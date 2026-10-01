const PLAYER_SPEED          = 0.1;
const PLAYER_MAX_HEALTH     = 100;
const PLAYER_MAX_MANA       = 100;
const MANA_REGEN            = 0.3;
const MANA_COST_SHOOT       = 25;

const BASE_ENEMY_SPEED      = 0.05;
const ENEMY_SPEED_PER_WAVE  = 0.008;
const ENEMY_SLOW_FACTOR     = 0.15;
const ENEMY_ATTACK_RANGE    = 1.0;
const ENEMY_DAMAGE          = 5;
const ENEMY_ATTACK_COOLDOWN = 40;

const PROJ_SPEED    = 0.3;
const PROJ_LIFE     = 120;
const VOLLEY_COUNT  = 1;
const VOLLEY_RANGE  = 8;
const VOLLEY_SPREAD = Math.PI / 3;
const ENEMY_COUNT   = 5;
const SPAWN_RADIUS  = 15;

export class Service {
	constructor(gameData) {
		this._data = gameData;
	}

	addPlayer() {
		const id     = String(this._data.nextPlayerId++);
		const player = { id, x: 0, z: 0, moveTarget: null, isMoving: false, health: PLAYER_MAX_HEALTH, mana: PLAYER_MAX_MANA, dead: false };
		this._data.players.set(id, player);
		return player;
	}

	removePlayer(id) {
		this._data.players.delete(id);
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
		this._tickCollisions();
		this._tickMana();
		this._tickEnemyAttacks();
	}

	_tickPlayers() {
		for (const p of this._data.players.values()) {
			if (p.dead || !p.isMoving || !p.moveTarget) continue;
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
		const alivePlayers = [...this._data.players.values()].filter(p => !p.dead);
		if (alivePlayers.length === 0) return;
		for (const e of this._data.enemies) {
			let nearest = alivePlayers[0], nearestDist = Infinity;
			for (const p of alivePlayers) {
				const d = Math.hypot(p.x - e.x, p.z - e.z);
				if (d < nearestDist) { nearestDist = d; nearest = p; }
			}
			const dx    = nearest.x - e.x;
			const dz    = nearest.z - e.z;
			const dist  = Math.sqrt(dx * dx + dz * dz);
			const speed = e.attackCooldown > 0 ? e.speed * ENEMY_SLOW_FACTOR : e.speed;
			if (dist > 0.1) { e.x += (dx / dist) * speed; e.z += (dz / dist) * speed; }
		}
	}

	_tickMana() {
		for (const p of this._data.players.values())
			if (!p.dead) p.mana = Math.min(PLAYER_MAX_MANA, p.mana + MANA_REGEN);
	}

	_tickEnemyAttacks() {
		const alivePlayers = [...this._data.players.values()].filter(p => !p.dead);
		for (const e of this._data.enemies) {
			if (e.attackCooldown > 0) { e.attackCooldown--; continue; }
			for (const p of alivePlayers) {
				if (Math.hypot(p.x - e.x, p.z - e.z) < ENEMY_ATTACK_RANGE) {
					p.health -= ENEMY_DAMAGE;
					if (p.health <= 0) { p.health = 0; p.dead = true; p.isMoving = false; }
					e.attackCooldown = ENEMY_ATTACK_COOLDOWN;
					break;
				}
			}
		}
	}

	_tickCollisions() {
		for (const [projId, p] of this._data.projectiles) {
			if (p.landed) continue;
			for (let i = this._data.enemies.length - 1; i >= 0; i--) {
				const e = this._data.enemies[i];
				if (Math.hypot(p.x - e.x, p.z - e.z) < 0.6) {
					this._data.projectiles.delete(projId);
					e.hp--;
					if (e.hp <= 0) this._data.enemies.splice(i, 1);
					break;
				}
			}
		}
		if (this._data.enemies.length === 0) {
			this._data.wave++;
			this._spawnEnemies();
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

	_spawnEnemies() {
		const wave    = this._data.wave;
		const hp      = wave;
		const speed   = BASE_ENEMY_SPEED + (wave - 1) * ENEMY_SPEED_PER_WAVE;
		const players = [...this._data.players.values()];
		for (let i = 0; i < ENEMY_COUNT; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r     = SPAWN_RADIUS + Math.random() * 5;
			const cx    = players.length ? players[Math.floor(Math.random() * players.length)].x : 0;
			const cz    = players.length ? players[Math.floor(Math.random() * players.length)].z : 0;
			this._data.enemies.push({
				id: `e${this._data.nextEnemyId++}`,
				x:  cx + Math.cos(angle) * r,
				z:  cz + Math.sin(angle) * r,
				hp, maxHp: hp, speed,
				attackCooldown: 0,
			});
		}
	}
}
