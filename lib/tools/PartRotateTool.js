class PartRotateTool extends Tool {
    constructor() {
        super()
        this.name = "Rotate Part"
        this.grabbedPart = null
        this.grabStart = createVector()
        this.rotStart = 0
    }

    update() {
        let mouse = this.workspace.mouse
        if (this.grabbedPart) {
            this.grabbedPart.rot = this.rotStart + (mouse.x - this.grabStart.x) / 10.0
        }
        super.update()
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
            if(this.hoveredPart){
                this.grabStart = mouse
                this.grabbedPart = this.hoveredPart
                this.rotStart = this.grabbedPart.rot
            }
        }

        if (p == false && button == 0) {
            this.grabbedPart = null
        }
    }
}