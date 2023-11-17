class TraceEditTool extends Tool {
	constructor() {
		super();
		this.name = "Trace Edit";
		this.editingTrace = null;

		// Traces will connect to a socket always positioned on the mouse pointer.
		this.mouseSocket = new Socket("Mouse Pointer", null, "any", "i");
	}

	update() {
		this.mouseSocket.globalPos = this.workspace.mousePos;
	}

	draw() {
		if (this.editingTrace) {
			this.editingTrace.draw();
		}
	}

	/**
	 *
	 * @param {Object} data
	 * @param {Socket} data.targetSocket The socket that was clicked.
	 */
	recieveHandoff(data) {
		let targetSocket = data.targetSocket;
		if (targetSocket.traces.length > 0) {
			// Grab any existing traces
			switch (targetSocket.io) {
				case "i":
					break;
				case "o":
					break;
			}
		} else {
			// Create a new trace
			this.editingTrace = new Trace(targetSocket, this.mouseSocket);
			this.editingTrace.workspace = this.workspace;
			this.mouseSocket.io = Socket.oppositeIO(targetSocket.io);
		}
	}

	/**
	 * A simple mouse event.
	 * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
	 * @param {Number} button Button index
	 * @param {MouseEvent} e Mouse Event
	 */
	mouseEvent(p, button, e) {
		if (button == 0) {
			if (!p) {
				for (let node of this.workspace.nodes) {
					for (let socket of node.allSockets) {
						if (
							socket.pointTouches(
								this.workspace.mousePos.x,
								this.workspace.mousePos.y
							)
						) {
							this.handleDrop(socket);
							this.handback();
							return;
						}
					}
				}
				this.editingTrace.remove();
				this.editingTrace = null;
				this.handback();
			}
		}
	}

	handleDrop(socket) {
		this.workspace.addTrace(this.editingTrace);
	}

	/**
	 * Extra event handler for mouse motion.
	 * @param {MouseEvent} e
	 */
	mouseMove(e) {}
}
