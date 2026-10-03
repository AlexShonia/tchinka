export function nearestTarget(actor, gameData) {
	let nearest = null, nearestDist = Infinity;
	for (const t of gameData.allAlive()) {
		if (t === actor || t.isDead || !actor.canAttack(t)) continue;
		const d = Math.hypot(t.x - actor.x, t.z - actor.z);
		if (d < nearestDist) { nearestDist = d; nearest = t; }
	}
	return nearest;
}


// everything the actor can attack within `radius` of the point (x, z)
export function targetsWithin(actor, gameData, x, z, radius) {
	const found = [];
	for (const t of gameData.allAlive())
		if (t !== actor && !t.isDead && actor.canAttack(t) && Math.hypot(t.x - x, t.z - z) <= radius) found.push(t);
	return found;
}
