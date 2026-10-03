import { State }  from "./types/State.js";
import { Event } from "./types/Event.js";
import { JumpAttackPhase, subState } from "./types/SubState.js";

// State -> { Event -> next State }. An Event missing from a State's row is ignored.
export const PlayerTransitions = {
	[State.IDLE]: {
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
	},
	[State.MOVING]: {
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.ARRIVED]:          State.IDLE,
	},
	[State.TARGETING]: {
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.TARGET_DEAD]:      State.IDLE,
		[Event.TARGET_REACHED]:   State.BASIC_ATTACK,
	},
	[State.BASIC_ATTACK]: {
		[Event.ATTACK_REQUESTED]: State.TARGETING,
		[Event.MOVE_REQUESTED]:   State.MOVING,
		[Event.ABILITY_ARMED]:    State.JUMP_ATTACK,
		[Event.ATTACK_FINISHED]:  State.TARGETING,
		[Event.TARGET_OUT_OF_RANGE]: State.TARGETING,
		[Event.TARGET_DEAD]:      State.IDLE,
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
};
