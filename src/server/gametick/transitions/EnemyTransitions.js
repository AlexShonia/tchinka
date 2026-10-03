import { State }  from "./types/State.js";
import { Event } from "./types/Event.js";

// State -> { Event -> next State }. An Event missing from a State's row is ignored.
export const EnemyTransitions = {
	[State.SEEK_TARGET]: {
		[Event.TARGET_FOUND]:    State.CHASE_AROUND,
	},
	[State.CHASE_AROUND]: {
		[Event.TARGET_DEAD]:     State.SEEK_TARGET,
		[Event.TARGET_REACHED]:  State.BASIC_ATTACK,
	},
	[State.BASIC_ATTACK]: {
		[Event.ATTACK_FINISHED]: State.CHASE_AROUND,
		[Event.TARGET_OUT_OF_RANGE]: State.CHASE_AROUND,
		[Event.TARGET_DEAD]:     State.SEEK_TARGET,
	},
};
