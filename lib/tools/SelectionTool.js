class SelectionTool extends Tool {
	constructor() {
		super();
		this.name = "Selection";
		this.lockSelection = false;
		this.marquee = false;
		this.marqueeAdditive = false;
		this.marqueeCorner = createVector();
		this.marqueeBox = new BoundingBox(this.marqueeCorner, 20, 20, 0);
		this.lmbDown = false;
		this.oldSelNodes = [];
	}

	update() {
		super.update();
		if (this.marquee) {
			PerfTrack.push("Marquee");
			var pos1 = this.marqueeCorner.copy();
			var pos2 = this.workspace.mousePos.copy();
			var avg = pos1.copy().add(pos2).mult(0.5); // average out positions for bb center
			var wide = abs(pos1.x - pos2.x);
			var high = abs(pos1.y - pos2.y);
			this.marqueeBox.pos = avg;
			this.marqueeBox.width = wide;
			this.marqueeBox.height = high;
			let marqueeNodes = this.workspace.nodes.filter((node) => {
				return BoundingBox.boxesIntersect(
					node.boundingBox,
					this.marqueeBox
				);
			});
			if (this.marqueeAdditive) {
				this.workspace.selectedNodes = [...this.oldSelNodes];
				marqueeNodes.forEach((node) => {
					if (!this.workspace.selectedNodes.includes(node)) {
						this.workspace.selectedNodes.push(node);
					}
				});
			} else {
				this.workspace.selectedNodes = marqueeNodes;
			}
			PerfTrack.pop();
		}
	}

	draw() {
		if (this.marquee) {
			push();
			//rectMode(CORNERS);
            noStroke()
			fill(255, 60);
			this.marqueeBox.boxTranslate();
			rectMode(CENTER);
            //this.marqueeBox.drawRect()
			rect(0, 0, this.marqueeBox.width, this.marqueeBox.height);
			stroke(255, 128);
			strokeWeight(1);
            strokeCap(SQUARE)
            noFill() 
			rect(0, 0, this.marqueeBox.width, this.marqueeBox.height);
			pop();
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
			this.lmbDown = p;
			if (p) {
				if (!this.marquee) {
					this.marqueeCorner = this.workspace.mousePos;
					this.marqueeAdditive = e.ctrlKey;
				}
				if (!e.ctrlKey) {
					this.workspace.selectedNodes = [];
				}
				let mpos = this.workspace.mousePos
				for (let i = this.workspace.nodes.length - 1; i >= 0; i--) {
					let node = this.workspace.nodes[i];
					for (let socket of node.allSockets) {
						if (socket.pointTouches(mpos.x, mpos.y)) {
							this.lmbDown = false
							this.handoffTool(TraceEditTool, {targetSocket: socket})
							return;
						}
					}
					if (
						node.boundingBox.pointIntersects(
							this.workspace.mousePos.x,
							this.workspace.mousePos.y
						)
					) {
						if (e.ctrlKey) {
							let ind =
								this.workspace.selectedNodes.indexOf(node);
							if (ind != -1) {
								this.workspace.selectedNodes.splice(ind, 1);
							} else {
								this.workspace.selectedNodes.push(node);
							}
						} else {
							this.workspace.selectedNodes.push(node);
						}
						break;
					}
				}
			} else {
				if (this.marquee) {
					this.marquee = false;
					console.log("Marquee stopped");
					this.oldSelNodes = [];
				}
			}
		}
	}

	/**
	 * Extra event handler for mouse motion.
	 * @param {MouseEvent} e
	 */
	mouseMove(e) {
		if (this.lmbDown) {
			if (!this.marquee) {
				this.marquee = true;
				console.log("Marquee started");
				this.oldSelNodes = [...this.workspace.selectedNodes];
			}
		}
	}
}
