export const TICK_MS = 20;

export const PLAYER_MOVE_SPEED = 0.1;

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
};

export const ENEMY_COMBAT = {
	windupTicks:   50,
	attackTicks:   6,
	recoveryTicks: 20,
	damage:        10,
};

export const toMs = ticks => ticks * TICK_MS;
