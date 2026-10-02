// What a state reports to its actor. The actor's transition map decides where each event leads.
export const StateEvent = Object.freeze({
	MOVE_REQUESTED:     "moveRequested",     // { moveTarget: { x, z } }
	ATTACK_REQUESTED:   "attackRequested",   // { targetId }
	ARRIVED:            "arrived",           // moving reached its destination
	TARGET_FOUND:       "targetFound",       // { targetId }
	TARGET_LOST:        "targetLost",        // target is gone, dead or not attackable
	TARGET_REACHED:     "targetReached",     // { targetId } in attack range / at the chase spot
	NOT_RECOVERED:      "notRecovered",      // { targetId } windup began while the previous attack's cooldown still runs
	WINDUP_FINISHED:    "windupFinished",    // { targetId }
	HIT_FINISHED:       "hitFinished",       // { targetId }
	RECOVERY_FINISHED:  "recoveryFinished",  // { targetId }
});
