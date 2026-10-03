export const TICK_MS = 20;

export const PLAYER_MOVE_SPEED = 0.1;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_MANA   = 100;
export const MANA_REGEN        = 0.05; // per tick

// placeholder numbers: xp to the next level is xpPerLevel * (level + 1), every enemy that dies gives xpPerKill to each living player
export const PLAYER_PROGRESSION = {
	xpPerKill:  10,
	xpPerLevel: 50,
};

export const PLAYER_COMBAT = {
	windupTicks:   10,
	attackTicks:   5,
	recoveryTicks: 55,
	cooldownTicks: 50,
	damage:        1,
};

// placeholder numbers
export const PLAYER_JUMP = {
	windupTicks:      12,
	airTicks:         20,
	damageMultiplier: 2,
	cooldownTicks:    250,
	manaCost:         30,
	unlockLevel:      0,
};

// placeholder numbers; speeds are world units per tick
export const PLAYER_CHARGE = {
	windupTicks:      8,
	speed:            0.45,
	bumpDistance:     1.2,
	recoveryTicks:    20,
	damageMultiplier: 2,
	knockback:        2.5,
	range:            10,
	cooldownTicks:    300,
	manaCost:         20,
	unlockLevel:      0,
};

// damage lands every tick, so the multiplier is tiny
export const PLAYER_SPIN = {
	durationTicks:       150,
	radius:              2.5,
	damageMultiplier:    0.1,
	moveSpeedMultiplier: 0.6,
	cooldownTicks:       600,
	manaCost:            40,
	unlockLevel:         0,
};

export const PLAYER_SHIELD = {
	windupTicks:      10,
	speed:            0.4,
	hitRadius:        0.7,
	catchDistance:    0.8,
	damageMultiplier: 1.5,
	bounceRange:      8,
	maxBounces:       5,
	range:            8,
	cooldownTicks:    400,
	manaCost:         35,
	unlockLevel:      0,
};

export const ENEMY_COMBAT = {
	windupTicks:   50,
	attackTicks:   6,
	recoveryTicks: 20,
	damage:        10,
};

export const toMs = ticks => ticks * TICK_MS;
