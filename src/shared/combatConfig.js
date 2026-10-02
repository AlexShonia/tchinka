export const TICK_MS = 20;

export const PLAYER_MOVE_SPEED = 0.1;

export const PLAYER_COMBAT = {
	windupTicks:   10,
	attackTicks:   5,
	recoveryTicks: 200,
	cooldownTicks: 50,
	damage:        1,
};

export const ENEMY_COMBAT = {
	windupTicks:   50,
	attackTicks:   6,
	recoveryTicks: 20,
	damage:        10,
};

export const toMs = ticks => ticks * TICK_MS;
