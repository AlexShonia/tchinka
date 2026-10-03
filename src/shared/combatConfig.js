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
	unlockLevel:      1,
};

export const ENEMY_COMBAT = {
	windupTicks:   50,
	attackTicks:   6,
	recoveryTicks: 20,
	damage:        10,
};

export const toMs = ticks => ticks * TICK_MS;
