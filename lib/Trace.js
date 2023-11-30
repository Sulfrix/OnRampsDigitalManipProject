/**
 * @typedef {Object} SerializedTrace
 * @property {string} socketA {node uuid}/{socket id}
 * @property {string} socketB {node uuid}/{socket id} 
 */

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

	/**
	 * 
	 * @returns {SerializedTrace}
	 */
	serialize() {
		return {
			socketA: this.socketA.node.uuid + "/" + this.socketA.id,
			socketB: this.socketB.node.uuid + "/" + this.socketB.id
		}
	}

	/**
	 * 
	 * @param {SerializedTrace} data 
	 * @param {Workspace} workspace
	 * @returns {Trace}
	 */
	static createFromData(data, workspace) {
		let asplit = data.socketA.split("/")
		let bsplit = data.socketB.split("/")
		let nodeA = workspace.findNodeByUUID(asplit[0])
		let nodeB = workspace.findNodeByUUID(bsplit[0])
		let socketA = nodeA.findSocketByID(asplit[1])
		let socketB = nodeB.findSocketByID(bsplit[1])
		return new Trace(socketA, socketB)
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
	 * The first socket. Should be an output socket in most cases.
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
	 * The second socket. Should be an input socket in most cases.
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
		push();
		stroke(255);
		noFill();
		strokeWeight(2.5 / Math.pow(this.workspace.zoom, 1 / 3));
		//strokeWeight(2)
		let curvature = Math.abs(
			this.socketA.forward.dot(
				this.socketB.globalPos.copy().sub(this.socketA.globalPos)
			) / 2
		);
		curvature = Math.max(curvature, this.socketA.globalPos.dist(this.socketB.globalPos)/10)
		//curvature = 40
		let bezierPoint1 = this.socketA.globalPos;
		let bezierPoint2 = this.socketA.globalPos
			.copy()
			.add(this.socketA.forward.copy().mult(curvature));
		let bezierPoint3 = this.socketB.globalPos
			.copy()
			.add(this.socketB.forward.copy().mult(curvature));
		let bezierPoint4 = this.socketB.globalPos;
		bezier(
			bezierPoint1.x,
			bezierPoint1.y,
			bezierPoint2.x,
			bezierPoint2.y,
			bezierPoint3.x,
			bezierPoint3.y,
			bezierPoint4.x,
			bezierPoint4.y
		);
		pop();
	}
}
