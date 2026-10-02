import { Enemy } from "../common/types/Enemy.js";
import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../shared/combatConfig.js";

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

		if (p.state === "windup") {
			p.states.windup.tick(() => {
				p.states.attack.enter(p.attackSpeed);
				p.state = "attack";
				const target = gameData.enemies.find(e => e.id === p.states.targeting.targetEnemyId);
				if (target && Math.hypot(target.x - p.x, target.z - p.z) < p.attackRange) {
					target.hp -= PLAYER_COMBAT.damage;
					if (target.hp <= 0) {
						const idx = gameData.enemies.indexOf(target);
						if (idx !== -1) gameData.enemies.splice(idx, 1);
						p.states.targeting.targetEnemyId = null;
					}
				}
			});
			continue;
		}

		if (p.state === "attack") {
			p.states.attack.tick(() => {
				p.states.recovery.enter(p.attackSpeed);
				p.state = "recovery";
			});
			continue;
		}

		if (p.state === "recovery") {
			p.states.recovery.tick(() => {
				p.states.cooldown.enter(p.attackSpeed);
				p.state = "cooldown";
			});
			continue;
		}

		if (p.state === "cooldown") {
			p.states.cooldown.tick(() => { p.state = "idle"; });
			continue;
		}

		if (p.state === "targeting") {
			const target = gameData.enemies.find(e => e.id === p.states.targeting.targetEnemyId);
			if (!target || target.hp <= 0) { p.state = "idle"; continue; }
			const dist = Math.hypot(target.x - p.x, target.z - p.z);
			if (dist <= p.attackRange) {
				p.states.windup.enter(p.attackSpeed);
				p.state = "windup";
			} else {
				const angle = Math.atan2(target.z - p.z, target.x - p.x);
				const destX = target.x - Math.cos(angle) * (p.attackRange * 0.8);
				const destZ = target.z - Math.sin(angle) * (p.attackRange * 0.8);
				const dx = destX - p.x, dz = destZ - p.z;
				const d  = Math.hypot(dx, dz);
				if (d > p.moveSpeed) { p.x += (dx / d) * p.moveSpeed; p.z += (dz / d) * p.moveSpeed; }
				else { p.x = destX; p.z = destZ; }
			}
			continue;
		}

		if (p.state === "moving") {
			const { moveTarget } = p.states.moving;
			const dx   = moveTarget.x - p.x;
			const dz   = moveTarget.z - p.z;
			const dist = Math.sqrt(dx * dx + dz * dz);
			if (dist <= p.moveSpeed) {
				p.x = moveTarget.x; p.z = moveTarget.z; p.state = "idle";
			} else {
				p.x += (dx / dist) * p.moveSpeed;
				p.z += (dz / dist) * p.moveSpeed;
			}
		}
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

		if (e.state === "windup") {
			e.states.windup.tick(() => {
				e.states.attack.enter(e.attackSpeed);
				e.state = "attack";
				if (Math.hypot(nearest.x - e.x, nearest.z - e.z) < e.attackRange) {
					nearest.health -= ENEMY_COMBAT.damage;
					nearest.hit = true;
					if (nearest.health <= 0) { nearest.health = 0; nearest.dead = true; nearest.state = "idle"; }
				}
			});
			continue;
		}

		if (e.state === "attack") {
			e.states.attack.tick(() => {
				e.states.recovery.enter(e.attackSpeed);
				e.state = "recovery";
			});
			continue;
		}

		if (e.state === "recovery") {
			e.states.recovery.tick(() => {
				e.states.prep.enter();
				e.state = "prep";
			});
			continue;
		}

		const destX = nearest.x + Math.cos(e.offsetAngle) * e.attackRange;
		const destZ = nearest.z + Math.sin(e.offsetAngle) * e.attackRange;
		const dist  = Math.hypot(destX - e.x, destZ - e.z);

		if (e.state === "prep") {
			if (dist > 0.3) {
				e.state       = "idle";
				e.offsetAngle = Math.random() * Math.PI * 2;
			} else {
				e.states.prep.tick(() => {
					e.states.windup.enter(e.attackSpeed);
					e.state = "windup";
				});
			}
			continue;
		}

		// state === "idle"
		if (dist < 0.08) {
			e.states.prep.enter();
			e.state = "prep";
		} else {
			e.x += ((destX - e.x) / dist) * e.speed;
			e.z += ((destZ - e.z) / dist) * e.speed;
		}
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
