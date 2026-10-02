export const StateName = Object.freeze({
	IDLE:         "idle",
	MOVING:       "moving",
	TARGETING:    "targeting",
	CHASE_AROUND: "chaseAround",
	BASIC_ATTACK: "basicAttack",
	DEAD:         "dead",

	// BasicAttackState sub-states
	WINDUP:       "windup",
	HIT:          "hit",
	RECOVERY:     "recovery",
});
