export class MovingState {
	constructor() {
		this.name       = "moving";
		this.moveTarget = null;
	}

	enter(moveTarget) {
		this.moveTarget = moveTarget;
	}
}
