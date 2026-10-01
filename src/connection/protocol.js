// ── Outgoing: client → server ─────────────────────────────────────────────

export class MoveMsg {
	constructor(x, z) { this.type = "move"; this.x = x; this.z = z; }
}

export class ShootMsg {
	constructor(x, z) { this.type = "shoot"; this.x = x; this.z = z; }
}

// ── Incoming: server → client ─────────────────────────────────────────────

export class WelcomeMsg {
	constructor(id) { this.id = id; }
}

export class StateMsg {
	constructor(players, enemies) { this.players = players; this.enemies = enemies; }
}

export class ShootEventMsg {
	constructor(id, x, z) { this.id = id; this.x = x; this.z = z; }
}
