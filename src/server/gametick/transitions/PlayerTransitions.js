import { State }  from "./types/State.js";
import { Event } from "./types/Event.js";
import {JumpAttackPhase, ShoulderChargePhase, subState} from "./types/SubState.js";

// State -> { Event -> next State }. An Event missing from a State's row is ignored.
const abilityRequests = {
	[Event.DASH_REQUESTED]:   State.SHOULDER_CHARGE,
	[Event.SPIN_REQUESTED]:   State.SPIN_ATTACK,
	[Event.SHIELD_REQUESTED]: State.SHIELD_THROW,
};

export const PlayerTransitions = {
	[State.IDLE]: {
		...abilityRequests,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
	},
	[State.MOVING]: {
		...abilityRequests,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.ARRIVED]:          State.IDLE,
	},
	[State.TARGETING]: {
		...abilityRequests,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.TARGET_DEAD]:      State.IDLE,
		[Event.TARGET_REACHED]:   State.BASIC_ATTACK,
	},
	[State.BASIC_ATTACK]: {
		...abilityRequests,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ABILITY_ARMED]:    State.JUMP_ATTACK,
		[Event.ATTACK_FINISHED]:  State.TARGETING,
		[Event.TARGET_OUT_OF_RANGE]: State.TARGETING,
		[Event.TARGET_DEAD]:      State.IDLE,
	},
	// the three abilities below can't be interrupted by the player; they only end by themselves
	[State.SHOULDER_CHARGE]: {
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ABILITY_FINISHED]: State.IDLE,
	},
	[subState(State.SHOULDER_CHARGE, ShoulderChargePhase.AIR)]: {
		[Event.MOVE_REQUESTED]:   null,
	},
	// ...except the spin lets you walk: MOVE_REQUESTED re-enters the spin, which only takes the new moveTarget
	[State.SPIN_ATTACK]: {
		[Event.MOVE_REQUESTED]:   State.SPIN_ATTACK,
		[Event.ABILITY_FINISHED]: State.IDLE,
	},
	[State.SHIELD_THROW]: {
		[Event.ABILITY_FINISHED]: State.IDLE,
	},
	// the jump follows the same rules as the basic attack...
	[State.JUMP_ATTACK]: {
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_FINISHED]:  State.TARGETING,
		[Event.TARGET_OUT_OF_RANGE]: State.TARGETING,
		[Event.TARGET_DEAD]:      State.IDLE,
	},
	// ...except while in the air, where it can't be walked out of (more specific rows win; null = ignored)
	[subState(State.JUMP_ATTACK, JumpAttackPhase.AIR)]: {
		[Event.MOVE_REQUESTED]:   null,
	},
	// ...except while in the air, where it can't be walked out of (more specific rows win; null = ignored)

};
