// Something an actor is doing right now. Each one has a class in states/ and the actor is in exactly one at a time.
export const State = Object.freeze({
	IDLE:         "idle",
	SEEK_TARGET:  "seekTarget",
	MOVING:       "moving",
	TARGETING:    "targeting",
	CHASE_AROUND: "chaseAround",
	BASIC_ATTACK: "basicAttack",
	JUMP_ATTACK:  "jumpAttack",
	DEAD:         "dead",
});
