import { Enemy } from "../common/types/Enemy.js";

const PLAYER_MAX_MANA      = 100;
const MANA_REGEN           = 0.3;

const BASE_ENEMY_SPEED     = 0.05;
const ENEMY_SPEED_PER_WAVE = 0.008;

const ENEMY_COUNT  = 5;
const SPAWN_RADIUS = 15;

export function tick(gameData) {
	tickPlayers(gameData);
	tickEnemies(gameData);
	tickWaves(gameData);
	tickMana(gameData);
}

function tickPlayers(gameData) {
	for (const p of gameData.players.values()) {
		p.hit = false;
		p.tickTimers();
		if (p.combatState.state === "dead") continue;
		p.currentState?.tick(p, gameData);
	}
}

function tickEnemies(gameData) {
	const alivePlayers = [...gameData.players.values()].filter(p => p.combatState.state !== "dead");
	if (alivePlayers.length === 0) return;

	for (const e of gameData.enemies) {
		e.tickTimers();
		let nearest = alivePlayers[0], nearestDist = Infinity;
		for (const p of alivePlayers) {
			const d = Math.hypot(p.x - e.x, p.z - e.z);
			if (d < nearestDist) { nearestDist = d; nearest = p; }
		}
		e.currentState.tick(e, gameData, nearest);
	}
}

function tickMana(gameData) {
	for (const p of gameData.players.values())
		if (p.combatState.state !== "dead") p.mana = Math.min(PLAYER_MAX_MANA, p.mana + MANA_REGEN);
}

function tickWaves(gameData) {
	if (gameData.enemies.length > 0) return;
	gameData.wave++;
	spawnEnemies(gameData);
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
