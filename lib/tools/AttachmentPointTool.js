class AttachmentPointTool extends Tool {
    constructor() {
        super();
        this.name = "Attachment Points";
        /**
         * @type {Attachment}
         */
        this.draggedPoint = null;
    }

    draw() { }

    update() {
        let mouse = this.workspace.mouse;
        if (this.draggedPoint) {
            this.draggedPoint.setRelPos(mouse.x, mouse.y);
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
        if (p && button == 0) {
            if (this.workspace.selectedPart) {
                if (!this.draggedPoint) {
                    let sPart = this.workspace.selectedPart;
                    let clickedPart;
                    for (let i = 0; i < sPart.attachments.length; i++) {
                        let atch = sPart.attachments[i];
                        let atchPos = atch.getPos();
                        console.log(mouse.dist)
                        if (mouse.dist(atchPos) < 20) {
                            clickedPart = atch;
                            break;
                        }
                    }
                    this.draggedPoint = clickedPart;
                }
            }
        }
        if (!p && button == 0) {
            if (this.draggedPoint) {
                this.draggedPoint = null;
            }
        }
    }
}