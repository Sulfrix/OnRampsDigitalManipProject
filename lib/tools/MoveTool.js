class MoveTool extends Tool {
	constructor() {
		super();
		this.name = "Move";
	}

	update() {
		var mouseDiff = this.workspace.mousePos
			.copy()
			.sub(this.workspace.pMousePos);
		for (let node of this.workspace.selectedNodes) {
			node.boundingBox.pos.add(mouseDiff);
		}
	}

	draw() {
		push();
		translate(this.workspace.mousePos.x, this.workspace.mousePos.y);
		scale(1 / this.workspace.zoom);
		stroke(0, 255, 0);
		strokeWeight(2);
		line(0, 0, 0, 25);
		stroke(255, 0, 0);
		line(0, 0, 25, 0);
		pop();
	}

	/**
	 * A simple mouse event.
	 * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
	 * @param {Number} button Button index
	 * @param {MouseEvent} e Mouse Event
	 */
	mouseEvent(p, button, e) {
		if (button == 0 && p) {
			this.workspace.selectTool(this.workspace.tools[0]);
		}
	}
}
