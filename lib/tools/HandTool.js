class HandTool extends Tool {
    constructor() {
        super();
        this.name = "Hand";
        this.dragging = null;
        this.dragOffset = null;
        this.cursorOffscreen = false;
    }

    activate(){
        super.activate();
        cursor('grab');
    }

    deactivate(){
        super.deactivate();
        cursor(ARROW);
    }

    update() {
        let mouse = this.workspace.mouse;
        if (this.dragging) {
            this.dragging.x = mouse.x + this.dragOffset.x;
            this.dragging.y = mouse.y + this.dragOffset.y;
            
            if (!this.workspace.validMousePoint(mouseX, mouseY)) { 
                this.workspace.grabOnCursor(this.dragging);
                this.dragging = null;
            }
        }
        if (this.workspace.validMousePoint(mouseX, mouseY)) {
            if (this.cursorOffscreen == true) {
                cursor('grab');
                this.cursorOffscreen = false;
            }
        } else {
            if (this.cursorOffscreen == false) {
                cursor(ARROW);
                this.cursorOffscreen = true;
            }
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
            if(this.hoveredPart){
                if (!this.cursorOffscreen) {
                    cursor('grabbing');
                }

                this.dragOffset = null;
                this.dragging = this.hoveredPart;
                this.dragging.detachFromParent();
                this.dragOffset = createVector(this.dragging.x - mouse.x, this.dragging.y - mouse.y);
            }
        }

        if (p == false && button == 0) {
            if(this.dragging){
                this.dragging.snapToPart();
            }
            this.dragging = null;
            if (!this.cursorOffscreen) {
                cursor('grab');
            }
        }
    }
}