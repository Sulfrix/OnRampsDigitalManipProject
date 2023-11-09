// Note: Rotating nodes will not be something that will be implemented in the future, but it was a fun excuse
// to flesh out the BoundingBox API with box collisions and more rotation support.

// To be honest, I think it would be funny to implement rotation for nodes and never expose functionality 

class RotateTool extends Tool {
    constructor() {
        super()
        this.name = "Rotate"
    }

    update() {
        var mouseDiff = this.workspace.mousePos.copy().sub(this.workspace.pMousePos)
        for (let node of this.workspace.selectedNodes) {
            node.boundingBox.rot += mouseDiff.x / 50
        }
    }

    draw() {
        push()
        translate(this.workspace.mousePos.x, this.workspace.mousePos.y)
        scale(1/this.workspace.zoom)
        stroke(0, 255, 0);
        strokeWeight(2);
        line(0, 0, 0, 25)
        stroke(255, 0, 0)
        line(0, 0, 25, 0)
        pop()
    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) {
        if (button == 0 && p) {
            if (e.ctrlKey) {
                for (let node of this.workspace.selectedNodes) {
                    node.boundingBox.rot = 0
                }
            }
            this.workspace.selectTool(this.workspace.tools[0])
        }
    }
}