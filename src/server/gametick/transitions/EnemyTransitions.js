import { StateName }  from "../states/name/StateName.js";
import { StateEvent } from "../states/name/StateEvent.js";

// state -> { event -> next state }. An event missing from a state's row is ignored.
export const EnemyTransitions = {
	[StateName.IDLE]: {
		[StateEvent.TARGET_FOUND]:       StateName.CHASE_AROUND,
	},
	[StateName.CHASE_AROUND]: {
		[StateEvent.TARGET_LOST]:        StateName.IDLE,
		[StateEvent.TARGET_REACHED]:     StateName.WINDUP,
	},
	[StateName.WINDUP]: {
		[StateEvent.WINDUP_FINISHED]:    StateName.HIT,
	},
	[StateName.HIT]: {
		[StateEvent.HIT_FINISHED]:       StateName.RECOVERY,
	},
	[StateName.RECOVERY]: {
		[StateEvent.RECOVERY_FINISHED]:  StateName.CHASE_AROUND,
	},
};
