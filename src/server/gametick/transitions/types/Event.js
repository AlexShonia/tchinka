// Something that happened. An actor never "is" an event, it only moves to a State when it receives one.
// The transition maps (transitions/) decide, per entity and per current State, which State an Event leads to.
// Events are grouped by who emits them, so you can see where each one comes from.
export const Event = Object.freeze({

	// emitted by incoming/service/service.js, from client messages
	MOVE_REQUESTED:   "moveRequested",   // { moveTarget: { x, z } }
	ATTACK_REQUESTED: "attackRequested", // { targetId }

	// emitted by MovingState
	ARRIVED:          "arrived",         // reached the destination

	// emitted by IdleState
	TARGET_FOUND:     "targetFound",     // { targetId } an enemy noticed something to chase

	// emitted by TargetingState and ChaseAroundState
	TARGET_LOST:      "targetLost",      // target is gone, dead or not attackable
	TARGET_REACHED:   "targetReached",   // { targetId } in attack range / at the chase spot

	// emitted by BasicAttackState
	ABILITY_ARMED:    "abilityArmed",    // { targetId } an ability is armed and replaces the running attack

	// emitted by BasicAttackState and JumpAttackState
	ATTACK_FINISHED:  "attackFinished",  // { targetId } windup, hit and recovery are all over
});
