export function nearestPlayer(actor, gameData) {
	let nearest = null, nearestDist = Infinity;
	for (const p of gameData.players.values()) {
		if (p.combatState.state === "dead") continue;
		const d = Math.hypot(p.x - actor.x, p.z - actor.z);
		if (d < nearestDist) { nearestDist = d; nearest = p; }
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
