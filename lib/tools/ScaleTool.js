class ScaleTool extends Tool {
    constructor() {
        super()
        this.name = "Scale"
    }

    update() {
        var mouseDiff = this.workspace.mousePos.copy().sub(this.workspace.pMousePos)
        for (let node of this.workspace.selectedNodes) {
            var change = mouseDiff.copy().rotate(-node.boundingBox.rot)
            node.boundingBox.width += change.x
            node.boundingBox.height += change.y
            if (node.boundingBox.width < 50) {
                node.boundingBox.width = 50
            }
            if (node.boundingBox.height < 50) {
                node.boundingBox.height = 50
            }
            if (frameCount % 2 == 0) {
                node.updateSize()
            }
        }
    }

    draw() {
        push()
        translate(this.workspace.mousePos.x, this.workspace.mousePos.y)
        let avgRot = 0
        for (let node of this.workspace.selectedNodes) {
            avgRot += node.boundingBox.rot
        }
        avgRot /= this.workspace.selectedNodes.length
        rotate(avgRot)
        scale(1/this.workspace.zoom)
        stroke(0, 255, 0);
        strokeWeight(2);
        line(0, 0, 0, 25)
        stroke(255, 0, 0)
        line(0, 0, 25, 0)
        pop()
    }

    activate() {
        super.activate()
        for (let node of this.workspace.selectedNodes) {
            node.tempInnerDetail = node.innerDetail
            node.innerDetail = 0.25
            node.forceClip = true
            node.updateSize()
        }
    }
    deactivate() {
        super.deactivate()
        for (let node of this.workspace.selectedNodes) {
            node.innerDetail = node.tempInnerDetail
            node.forceClip = false
            delete node.tempInnerDetail
            node.updateSize()
        }
    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) {
        if (button == 0 && p) {
            this.workspace.selectTool(this.workspace.tools[0])
        }
    }
}