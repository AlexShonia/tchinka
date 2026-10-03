// A phase inside one state class (an attack is one state with phases, not several states).
export const BasicAttackPhase = Object.freeze({
	WINDUP:   "windup",
	HIT:      "hit",
	RECOVERY: "recovery",
});

export const JumpAttackPhase = Object.freeze({
	WINDUP:   "windup",
	AIR:      "air",
	RECOVERY: "recovery",
});

export const ShoulderChargePhase = Object.freeze({
	WINDUP:   "windup",
	RUSH:     "rush",
	RECOVERY: "recovery",
});

export const ShieldThrowPhase = Object.freeze({
	WINDUP: "windup",
	FLIGHT: "flight",
	RETURN: "return",
});

// Key for a transition row that only applies while `state` is in `substate`, e.g. subState(State.BASIC_ATTACK, BasicAttackPhase.HIT).
// It beats the plain State row for any event it lists; `null` as the target means "ignore this event here".
export const subState = (state, substate) => `${state}.${substate}`;
