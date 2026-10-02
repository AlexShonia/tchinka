import { StateName }  from "../states/name/StateName.js";
import { StateEvent } from "../states/name/StateEvent.js";

// state -> { event -> next state }. An event missing from a state's row is ignored.
export const PlayerTransitions = {
	[StateName.IDLE]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]:   StateName.TARGETING,
	},
	[StateName.MOVING]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]:   StateName.TARGETING,
		[StateEvent.ARRIVED]:            StateName.IDLE,
	},
	[StateName.TARGETING]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.ATTACK_REQUESTED]:   StateName.TARGETING,
		[StateEvent.TARGET_LOST]:        StateName.IDLE,
		[StateEvent.TARGET_REACHED]:     StateName.WINDUP,
		[StateEvent.ATTACK_ON_COOLDOWN]: StateName.RECOVERY,
	},
	[StateName.WINDUP]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.WINDUP_FINISHED]:    StateName.HIT,
	},
	[StateName.HIT]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.HIT_FINISHED]:       StateName.RECOVERY,
	},
	[StateName.RECOVERY]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.RECOVERY_FINISHED]:  StateName.TARGETING,
	},
};
