import { Enemy } from "../common/types/Enemy.js";
import { PLAYER_MAX_MANA, MANA_REGEN, PLAYER_PROGRESSION } from "../../shared/combatConfig.js";

const BASE_ENEMY_SPEED     = 0.05;
const ENEMY_SPEED_PER_WAVE = 0.008;

const ENEMY_COUNT  = 5;
const SPAWN_RADIUS = 15;

export function tick(gameData) {
	tickPlayers(gameData);
	tickEnemies(gameData);
	removeDeadEnemies(gameData);
	tickWaves(gameData);
	tickMana(gameData);
}

function tickPlayers(gameData) {
	for (const p of gameData.players.values()) {
		p.hit = false;
		for (const s of Object.values(p.combatState.states)) s.passiveTick();
		if (p.isDead) continue;
		p.currentState?.tick(gameData);
	}
}

function tickEnemies(gameData) {
	for (const e of gameData.enemies) {
		for (const s of Object.values(e.combatState.states)) s.passiveTick();
		e.currentState.tick(gameData);
	}
}

function removeDeadEnemies(gameData) {
	const alive  = gameData.enemies.filter(e => !e.isDead);
	const killed = gameData.enemies.length - alive.length;
	gameData.enemies = alive;
	if (killed === 0) return;
	for (const p of gameData.players.values())
		if (!p.isDead) p.gainXp(killed * PLAYER_PROGRESSION.xpPerKill);
}

function tickMana(gameData) {
	for (const p of gameData.players.values())
		if (!p.isDead) p.mana = Math.min(PLAYER_MAX_MANA, p.mana + MANA_REGEN);
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
