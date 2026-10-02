export class TargetingState {
	constructor() {
		this.name          = "targeting";
		this.targetEnemyId = null;
	}

	enter(targetEnemyId) {
		this.targetEnemyId = targetEnemyId;
	}
}
