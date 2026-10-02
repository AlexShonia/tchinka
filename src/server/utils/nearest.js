export function nearestTarget(actor, gameData) {
	let nearest = null, nearestDist = Infinity;
	for (const t of gameData.allAlive()) {
		if (t === actor || t.isDead || !actor.canAttack(t)) continue;
		const d = Math.hypot(t.x - actor.x, t.z - actor.z);
		if (d < nearestDist) { nearestDist = d; nearest = t; }
	}
	return nearest;
}

export function nearestEnemy(actor, gameData) {
	let nearest = null, nearestDist = Infinity;
	for (const e of gameData.enemies) {
		const d = Math.hypot(e.x - actor.x, e.z - actor.z);
		if (d < nearestDist) { nearestDist = d; nearest = e; }
	}
	return nearest;
}
