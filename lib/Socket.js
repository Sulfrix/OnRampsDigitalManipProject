/**
 * Determines if a socket is an input socket or an output socket
 * @typedef {("i" | "o")} SocketIO
 */

class Socket {
	/**
	 * Point for connections between nodes
	 * @param {String} name Displayed name of the socket.
	 * @param {PNode} node The associated node.
	 * @param {String} type Variable type.
	 * @param {SocketIO} io Controls whether this socket is an input or an output
	 */
	constructor(name, node, type, io) {
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

	pointTouches(x, y) {
		return (abs(this.globalPos.x - x) < 10) && (abs(this.globalPos.y - y) < 10)
	}

	/**
	 * Inverts the SocketIO type
	 * @param {SocketIO} io 
	 * @returns {SocketIO} "i" if input is "o" and vice versa
	 */
	static oppositeIO(io) {
		switch (io) {
			case "i":
				return "o"
			case "o":
				return "i"
		}
	}
}
