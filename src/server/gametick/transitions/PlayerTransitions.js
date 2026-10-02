import { StateName }  from "../states/name/StateName.js";
import { StateEvent } from "../states/name/StateEvent.js";

// state -> { event -> next state }. An event missing from a state's row is ignored.
export const PlayerTransitions = {
	[StateName.IDLE]: {
		[StateEvent.MOVE_REQUESTED]:   StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]: StateName.TARGETING,
	},
	[StateName.MOVING]: {
		[StateEvent.MOVE_REQUESTED]:   StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]: StateName.TARGETING,
		[StateEvent.ARRIVED]:          StateName.IDLE,
	},
	[StateName.TARGETING]: {
		[StateEvent.MOVE_REQUESTED]:   StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]: StateName.TARGETING,
		[StateEvent.TARGET_LOST]:      StateName.IDLE,
		[StateEvent.TARGET_REACHED]:   StateName.BASIC_ATTACK,
	},
	[StateName.BASIC_ATTACK]: {
		[StateEvent.MOVE_REQUESTED]:   StateName.MOVING,
		[StateEvent.ABILITY_ARMED]:    StateName.JUMP_ATTACK,
		[StateEvent.ATTACK_FINISHED]:  StateName.TARGETING,
	},
	[StateName.JUMP_ATTACK]: { // MOVE_REQUESTED is vetoed by the state while in the air
		[StateEvent.MOVE_REQUESTED]:   StateName.MOVING,
		[StateEvent.ATTACK_FINISHED]:  StateName.TARGETING,
	},
};
