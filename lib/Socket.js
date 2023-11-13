class Socket {
	/**
	 * Point for connections between nodes
	 * @param {String} name Displayed name of the socket.
	 * @param {PNode} node The associated node.
	 * @param {String} type Variable type.
	 * @param {("i" | "o")} io Controls whether this socket is an input or an output
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
	}
}
