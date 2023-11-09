class SelectionTool extends Tool {
    constructor() {
        super()
        this.name = "Selection"
        this.lockSelection = false;
    }


    update() {
        super.update()

    }

    draw() {

    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) {
        if (button == 0) {
            if (p) {
                this.workspace.selectedNodes = []
                for (let i = this.workspace.nodes.length-1; i >= 0; i--) {
                    let node = this.workspace.nodes[i]
                    if (node.boundingBox.pointIntersects(this.workspace.mousePos.x, this.workspace.mousePos.y)) {
                        this.workspace.selectedNodes.push(node)
                        break
                    }
                }
            }
        }
    }
}