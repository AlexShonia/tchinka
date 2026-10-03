// Something that happened. An actor never "is" an event, it only moves to a State when it receives one.
// The transition maps (transitions/) decide, per entity and per current State, which State an Event leads to.
// Events are grouped by who emits them, so you can see where each one comes from.
export const Event = Object.freeze({

	// emitted by incoming/service/service.js, from client messages
	MOVE_REQUESTED:   "moveRequested",   // { moveTarget: { x, z } }
	ATTACK_REQUESTED: "attackRequested", // { targetId }

	DASH_REQUESTED:   "dashRequested",   // { targetId } W: shoulder charge at an enemy
	SPIN_REQUESTED:   "spinRequested",   // E: spin attack
	SHIELD_REQUESTED: "shieldRequested", // { targetId } R: throw the shield

	// emitted by MovingState
	ARRIVED:          "arrived",         // reached the destination

	// emitted by SeekTargetState
	TARGET_FOUND:     "targetFound",     // { targetId } found something to chase

	// emitted by TargetingState and ChaseAroundState
	TARGET_REACHED:   "targetReached",   // { targetId } in attack range / at the chase spot

	// emitted by TargetingState, ChaseAroundState and BasicAttackState
	TARGET_DEAD:      "targetDead",      // target is gone, dead or not attackable

	// emitted by BasicAttackState
	TARGET_OUT_OF_RANGE: "targetOutOfRange", // { targetId } target moved out of attack range, go after it again
	ABILITY_ARMED:    "abilityArmed",    // { targetId } an ability is armed and replaces the running attack

	// emitted by BasicAttackState and JumpAttackState
	ATTACK_FINISHED:  "attackFinished",  // { targetId } windup, hit and recovery are all over

	// emitted by ShoulderChargeState, SpinAttackState and ShieldThrowState
	ABILITY_FINISHED: "abilityFinished", // the ability ran its course
});
