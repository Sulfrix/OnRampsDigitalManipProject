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
		if (this.editingTrace) {
			this.mouseSocket.forward = this.editingTrace.socketA.forward.copy().mult(-1)
		}
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
					//targetSocket.clearTraces();
					//this.startMouseTraceFrom(targetSocket)
					let grabTrace = targetSocket.traces[0] // Input sockets should only ever have one trace
					this.workspace.removeTrace(grabTrace)
					this.editingTrace = grabTrace 
					this.editingTrace.socketB = this.mouseSocket
					break;
				case "o":
					this.startMouseTraceFrom(targetSocket)
					break;
			}
		} else {
			this.startMouseTraceFrom(targetSocket)
		}
	}

	startMouseTraceFrom(targetSocket) {
		// Create a new trace
		this.editingTrace = new Trace(targetSocket, this.mouseSocket);
		this.editingTrace.workspace = this.workspace;
		this.mouseSocket.io = Socket.oppositeIO(targetSocket.io);
	}

	/**
	 * A simple mouse event.
	 * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
	 * @param {Number} button Button index
	 * @param {MouseEvent} e Mouse Event
	 */
	mouseEvent(p, button, e) {
		if (button == 0) {
			if (!p && this.editingTrace) {
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
							this.editingTrace = null;
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

	/**
	 *
	 * @param {Socket} socket
	 */
	handleDrop(socket) {
		if (this.editingTrace.socketA.io == socket.io) {
			return;
		}
		if (this.editingTrace.socketA == socket) {
			return;
		}
		if (socket.io == "i") {
			socket.clearTraces();
			this.workspace.addTrace(this.editingTrace);
			this.editingTrace.socketB = socket;
		}
		if (socket.io == "o") {
			// Trace was dropped on an output socket, so the target socket should be the first
			let swap = this.editingTrace.socketA;
			this.editingTrace.socketA = socket;
			this.editingTrace.socketB = swap;
			this.workspace.addTrace(this.editingTrace);
		}
	}

	/**
	 * Extra event handler for mouse motion.
	 * @param {MouseEvent} e
	 */
	mouseMove(e) {}
}
