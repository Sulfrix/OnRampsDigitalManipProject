class Trace {
	/**
	 * Trace object, used for connecting sockets together
	 * @param {Socket} socketA
	 * @param {Socket} socketB
	 */
	constructor(socketA, socketB) {
		this.socketA = socketA;
		this.socketB = socketB;
		/**
		 * The parent workspace. Will not draw without this set.
		 * @type {Workspace}
		 */
		this.workspace = null;
	}

	set socketA(value) {
		if (this.socketA) {
			this.socketA.traces.splice(this.socketA.traces.indexOf(this), 1);
		}
		if (value) {
			this._socketA = value;
			this._socketA.traces.push(this);
		}
	}

	/**
	 * @returns {Socket}
	 */
	get socketA() {
		return this._socketA;
	}

	set socketB(value) {
		if (this.socketB) {
			this.socketB.traces.splice(this.socketB.traces.indexOf(this), 1);
		}
		if (value) {
			this._socketB = value;
			this._socketB.traces.push(this);
		}
	}

	/**
	 * @returns {Socket}
	 */
	get socketB() {
		return this._socketB;
	}

	remove() {
		this.socketA = null;
		this.socketB = null;
	}

	// ooh yeah bézier time
	draw() {
		// TODO: make it a bezier curve
		push();
		stroke(255);
		noFill();
		strokeWeight(2 / this.workspace.zoom);
		line(
			this.socketA.globalPos.x,
			this.socketA.globalPos.y,
			this.socketB.globalPos.x,
			this.socketB.globalPos.y
		);
		pop();
	}
}
