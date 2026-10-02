export class BaseState {
	passiveTick() {}
	tick(gameData) {}
	processMoveRequest(x, z) {}
	processAttackRequest(targetEnemyId) {}
}
