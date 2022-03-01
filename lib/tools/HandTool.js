class HandTool extends Tool {
    constructor() {
        super();
        this.name = "Hand";
        this.dragging = [];
        this.dragOffset = [];
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
        for(let i in this.dragging) {
            let targetPos = createVector;
            targetPos.x = mouse.x + this.dragOffset[i].x;
            targetPos.y = mouse.y + this.dragOffset[i].y;
            this.dragging[i].updatePosition(targetPos);
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
                cursor('grabbing');

                this.dragOffset = [];
                this.dragging = this.hoveredPart.findChildren();
                for(let i in this.dragging){
                    this.dragOffset.push(createVector());
                    this.dragOffset[i].x = this.dragging[i].x - mouse.x;
                    this.dragOffset[i].y = this.dragging[i].y - mouse.y;
                }
                
                console.log(this.dragging);
            }
        }

        if (p == false && button == 0) {
            if(this.dragging.length > 0){
                console.log(this.dragging[0]);
                this.dragging[0].snapToPart();
            }
            this.dragging = [];
            cursor('grab');
        }
    }
}