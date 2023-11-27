/**
 * Determines if a socket is an input socket or an output socket
 * @typedef {("i" | "o")} SocketIO
 */

/**
 * @typedef {Object} SerializedSocket
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {SocketIO} io
 */

class Socket {
	/**
	 * Point for connections between nodes
	 * @param {String} name Displayed name of the socket.
	 * @param {String} id Unique name for the socket.
	 * @param {PNode} node The associated node.
	 * @param {String} type Variable type.
	 * @param {SocketIO} io Controls whether this socket is an input or an output
	 */
	constructor(name, id, node, type, io) {
		this.id = id;
		this.name = name;
		this.node = node;
		this.type = type;
		this.io = io;
		/**
		 * Assigned by the node when drawing, used for connection visuals and detection.
		 */
		this.pos = createVector();
		this.globalPos = createVector();

		this.forward = createVector(1, 0);
		/**
		 * @type {Trace[]}
		 */
		this.traces = [];
	}

	/**
	 * 
	 * @returns {SerializedSocket}
	 */
	serialize() {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			io: this.io
		}
	}

	/**
	 * 
	 * @param {SerializedSocket} data 
	 * @param {PNode} node
	 */
	static createFromData(data, node) {
		return new Socket(data.name, data.id, node, data.type, data.io)
	}

	pointTouches(x, y) {
		return abs(this.globalPos.x - x) < 10 && abs(this.globalPos.y - y) < 10;
	}

	clearTraces() {
		this.traces.forEach((trace) => {
			trace.remove();
			if (this.node) {
				if (this.node.workspace) {
					this.node.workspace.removeTrace(trace)
				}
			}
		});
	}

	/**
	 * Inverts the SocketIO type
	 * @param {SocketIO} io
	 * @returns {SocketIO} "i" if input is "o" and vice versa
	 */
	static oppositeIO(io) {
		switch (io) {
			case "i":
				return "o";
			case "o":
				return "i";
		}
	}
}
