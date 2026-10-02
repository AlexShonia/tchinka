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
	},
	[StateName.WINDUP]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.NOT_RECOVERED]:      StateName.RECOVERY,
		[StateEvent.ABILITY_ARMED]:      StateName.JUMP_WINDUP,
		[StateEvent.WINDUP_FINISHED]:    StateName.HIT,
	},
	[StateName.HIT]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.ABILITY_REQUESTED]:  StateName.JUMP_WINDUP,
		[StateEvent.HIT_FINISHED]:       StateName.RECOVERY,
	},
	[StateName.JUMP_WINDUP]: { // cancellable: the ability stays armed
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.WINDUP_FINISHED]:    StateName.JUMP_AIR,
	},
	[StateName.JUMP_AIR]: { // no MOVE_REQUESTED: can't cancel mid-air
		[StateEvent.HIT_FINISHED]:       StateName.JUMP_RECOVERY,
	},
	[StateName.JUMP_RECOVERY]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.RECOVERY_FINISHED]:  StateName.TARGETING,
	},
	[StateName.RECOVERY]: {
		[StateEvent.MOVE_REQUESTED]:     StateName.MOVING,
		[StateEvent.ABILITY_REQUESTED]:  StateName.JUMP_WINDUP,
		[StateEvent.RECOVERY_FINISHED]:  StateName.TARGETING,
	},
};
