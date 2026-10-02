// What a state reports to its actor. The actor's transition map decides where each event leads.
export const StateEvent = Object.freeze({
	MOVE_REQUESTED:   "moveRequested",   // { moveTarget: { x, z } }
	ATTACK_REQUESTED: "attackRequested", // { targetId }
	ARRIVED:          "arrived",         // moving reached its destination
	TARGET_FOUND:     "targetFound",     // { targetId }
	TARGET_LOST:      "targetLost",      // target is gone, dead or not attackable
	TARGET_REACHED:   "targetReached",   // { targetId } in attack range / at the chase spot
	ABILITY_ARMED:    "abilityArmed",    // { targetId } an attack began (or is running) with an ability armed that replaces it
	ATTACK_FINISHED:  "attackFinished",  // { targetId } windup, hit and recovery are all over
});
