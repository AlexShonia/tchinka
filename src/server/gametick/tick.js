import { Enemy } from "../common/types/Enemy.js";

const PLAYER_MAX_MANA      = 100;
const MANA_REGEN           = 0.3;

const BASE_ENEMY_SPEED     = 0.05;
const ENEMY_SPEED_PER_WAVE = 0.008;

const PROJ_SPEED   = 0.3;
const ENEMY_COUNT  = 5;
const SPAWN_RADIUS = 15;

export function tick(gameData) {
	tickPlayers(gameData);
	tickEnemies(gameData);
	tickProjectiles(gameData);
	tickCollisions(gameData);
	tickMana(gameData);
}

function tickPlayers(gameData) {
	for (const p of gameData.players.values()) {
		p.hit = false;
		if (p.dead) continue;
		p.states[p.state]?.tick(p, gameData);
	}
}

function tickEnemies(gameData) {
	const alivePlayers = [...gameData.players.values()].filter(p => !p.dead);
	if (alivePlayers.length === 0) return;

	for (const e of gameData.enemies) {
		let nearest = alivePlayers[0], nearestDist = Infinity;
		for (const p of alivePlayers) {
			const d = Math.hypot(p.x - e.x, p.z - e.z);
			if (d < nearestDist) { nearestDist = d; nearest = p; }
		}
		e.states[e.state].tick(e, gameData, nearest);
	}
}

function tickMana(gameData) {
	for (const p of gameData.players.values())
		if (!p.dead) p.mana = Math.min(PLAYER_MAX_MANA, p.mana + MANA_REGEN);
}

function tickCollisions(gameData) {
	for (const [projId, p] of gameData.projectiles) {
		if (p.state === "landed") continue;
		for (let i = gameData.enemies.length - 1; i >= 0; i--) {
			const e = gameData.enemies[i];
			if (Math.hypot(p.x - e.x, p.z - e.z) < 0.6) {
				gameData.projectiles.delete(projId);
				e.hp--;
				if (e.hp <= 0) gameData.enemies.splice(i, 1);
				break;
			}
		}
	}
	if (gameData.enemies.length === 0) {
		gameData.wave++;
		spawnEnemies(gameData);
	}
}

function tickProjectiles(gameData) {
	for (const [id, p] of gameData.projectiles) {
		if (p.state === "landed") {
			if (--p.life <= 0) gameData.projectiles.delete(id);
			continue;
		}
		const dx   = p.toX - p.x;
		const dz   = p.toZ - p.z;
		const dist = Math.sqrt(dx * dx + dz * dz);
		if (dist <= PROJ_SPEED) {
			p.x = p.toX; p.z = p.toZ; p.state = "landed";
		} else {
			p.x += p.dirX * PROJ_SPEED;
			p.z += p.dirZ * PROJ_SPEED;
		}
	}
}

function spawnEnemies(gameData) {
	const wave    = gameData.wave;
	const hp      = wave;
	const speed   = BASE_ENEMY_SPEED + (wave - 1) * ENEMY_SPEED_PER_WAVE;
	const players = [...gameData.players.values()];
	for (let i = 0; i < ENEMY_COUNT; i++) {
		const angle = Math.random() * Math.PI * 2;
		const r     = SPAWN_RADIUS + Math.random() * 5;
		const cx    = players.length ? players[Math.floor(Math.random() * players.length)].x : 0;
		const cz    = players.length ? players[Math.floor(Math.random() * players.length)].z : 0;
		gameData.enemies.push(new Enemy(
			`e${gameData.nextEnemyId++}`,
			cx + Math.cos(angle) * r,
			cz + Math.sin(angle) * r,
			hp, speed,
		));
	}
}
