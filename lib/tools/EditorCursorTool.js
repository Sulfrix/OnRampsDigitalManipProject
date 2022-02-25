class EditorCursorTool extends Tool {
    constructor() {
        super();
        this.name = "Cursor";
        this.dragging = null;
        this.dragOffset = createVector();
    }

    update() {
        let mouse = this.workspace.mouse;
        if (this.dragging) {
            this.dragging.x = mouse.x + this.dragOffset.x;
            this.dragging.y = mouse.y + this.dragOffset.y;
        }
        super.update();
    }

    draw() {
        let mouse = this.workspace.mousePos;
        for (let part of this.workspace.parts) {
            if (part.boundingBox.pointIntersects(mouse.x, mouse.y)) {
                push();
                noStroke();
                fill(255, 50);
                part.boundingBox.drawRect();
                pop();
            }
        }
    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) {
        let mouse = this.workspace.mouse;
        if (p == true && button == 0) {
            if (this.hoveredPart) {
                if (this.hoveredPart != this.workspace.selectedPart) {
                    this.workspace.selectedPart = this.hoveredPart;
                    updatePartsList();
                } else {
                    this.dragging = this.hoveredPart;
                    this.dragOffset.x = this.hoveredPart.x - mouse.x;
                    this.dragOffset.y = this.hoveredPart.y - mouse.y;
                }
            }
        }

        if (p == false && button == 0) {
            this.dragging = null;
        }
    }
}