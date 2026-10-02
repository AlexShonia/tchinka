import { Enemy } from "../common/types/Enemy.js";
import { WindupState }   from "./states/WindupState.js";
import { AttackState }   from "./states/AttackState.js";
import { RecoveryState } from "./states/RecoveryState.js";
import { PLAYER_COMBAT, ENEMY_COMBAT } from "../../shared/combatConfig.js";

const PLAYER_SPEED         = 0.1;
const PLAYER_MAX_MANA      = 100;
const MANA_REGEN           = 0.3;

const BASE_ENEMY_SPEED     = 0.05;
const ENEMY_SPEED_PER_WAVE = 0.008;

const playerWindup   = new WindupState(PLAYER_COMBAT.windupTicks);
const playerAttack   = new AttackState(PLAYER_COMBAT.attackTicks);
const playerRecovery = new RecoveryState(PLAYER_COMBAT.recoveryTicks);

const enemyWindup    = new WindupState(ENEMY_COMBAT.windupTicks);
const enemyAttack    = new AttackState(ENEMY_COMBAT.attackTicks);
const enemyRecovery  = new RecoveryState(ENEMY_COMBAT.recoveryTicks);

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

		if (p.attackCooldown > 0) p.attackCooldown--;

		if (p.state === playerWindup.name) {
			playerWindup.tick(p, entity => {
				playerAttack.enter(entity);
				entity.state = playerAttack.name;
				const target = gameData.enemies.find(e => e.id === entity.targetEnemyId);
				if (target && Math.hypot(target.x - entity.x, target.z - entity.z) < entity.attackRange) {
					target.hp -= PLAYER_COMBAT.damage;
					if (target.hp <= 0) {
						const idx = gameData.enemies.indexOf(target);
						if (idx !== -1) gameData.enemies.splice(idx, 1);
						entity.targetEnemyId = null;
					}
				}
			});
			continue;
		}

		if (p.state === playerAttack.name) {
			playerAttack.tick(p, entity => {
				playerRecovery.enter(entity);
				entity.state = playerRecovery.name;
			});
			continue;
		}

		if (p.state === playerRecovery.name) {
			playerRecovery.tick(p, entity => {
				entity.state          = "idle";
				entity.attackTimer    = 0;
				entity.attackCooldown = Math.round(PLAYER_COMBAT.cooldownTicks / (entity.attackSpeed ?? 1));
			});
			continue;
		}

		if (p.targetEnemyId) {
			const target = gameData.enemies.find(e => e.id === p.targetEnemyId);
			if (!target || target.hp <= 0) { p.targetEnemyId = null; continue; }
			const dist = Math.hypot(target.x - p.x, target.z - p.z);
			if (dist <= p.attackRange && p.attackCooldown <= 0) {
				playerWindup.enter(p);
				p.state = playerWindup.name;
			} else if (dist > p.attackRange) {
				const angle = Math.atan2(target.z - p.z, target.x - p.x);
				const destX = target.x - Math.cos(angle) * (p.attackRange * 0.8);
				const destZ = target.z - Math.sin(angle) * (p.attackRange * 0.8);
				const dx = destX - p.x, dz = destZ - p.z;
				const d  = Math.hypot(dx, dz);
				if (d > PLAYER_SPEED) { p.x += (dx / d) * PLAYER_SPEED; p.z += (dz / d) * PLAYER_SPEED; }
				else { p.x = destX; p.z = destZ; }
			}
			continue;
		}

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

function tickEnemies(gameData) {
	const alivePlayers = [...gameData.players.values()].filter(p => !p.dead);
	if (alivePlayers.length === 0) return;

	for (const e of gameData.enemies) {
		let nearest = alivePlayers[0], nearestDist = Infinity;
		for (const p of alivePlayers) {
			const d = Math.hypot(p.x - e.x, p.z - e.z);
			if (d < nearestDist) { nearestDist = d; nearest = p; }
		}

		if (e.state === enemyWindup.name) {
			enemyWindup.tick(e, entity => {
				enemyAttack.enter(entity);
				entity.state = enemyAttack.name;
				if (Math.hypot(nearest.x - entity.x, nearest.z - entity.z) < entity.attackRange) {
					nearest.health -= ENEMY_COMBAT.damage;
					nearest.hit = true;
					if (nearest.health <= 0) { nearest.health = 0; nearest.dead = true; nearest.isMoving = false; }
				}
			});
			continue;
		}

		if (e.state === enemyAttack.name) {
			enemyAttack.tick(e, entity => {
				enemyRecovery.enter(entity);
				entity.state = enemyRecovery.name;
			});
			continue;
		}

		if (e.state === enemyRecovery.name) {
			enemyRecovery.tick(e, entity => {
				entity.state     = "prep";
				entity.prepTimer = ENEMY_COMBAT.prepTicks;
			});
			continue;
		}

		const destX = nearest.x + Math.cos(e.offsetAngle) * e.attackRange;
		const destZ = nearest.z + Math.sin(e.offsetAngle) * e.attackRange;
		const dist  = Math.hypot(destX - e.x, destZ - e.z);

		if (e.state === "prep") {
			if (dist > 0.3) {
				e.state       = "idle";
				e.prepTimer   = 0;
				e.offsetAngle = Math.random() * Math.PI * 2;
			} else {
				e.prepTimer--;
				if (e.prepTimer <= 0) {
					enemyWindup.enter(e);
					e.state  = enemyWindup.name;
					e.target = nearest.id;
				}
			}
			continue;
		}

		// state === "idle"
		if (dist < 0.08) {
			e.state     = "prep";
			e.prepTimer = ENEMY_COMBAT.prepTicks;
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
		if (p.landed) continue;
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
		if (p.landed) {
			if (--p.life <= 0) gameData.projectiles.delete(id);
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
