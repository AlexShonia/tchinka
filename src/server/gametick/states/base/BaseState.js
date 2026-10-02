//Architectural Decision: passive tick only updates state specific data, not including gameData or actor, mostly used for cooldowns
export class BaseState {
	passiveTick() {}
	tick(gameData) {}
	processMoveRequest(x, z) {}
	processAttackRequest(targetEnemyId) {}
}
