class AttachmentPointTool extends Tool {
    constructor() {
        super();
        this.name = "Attachment Points";
        /**
         * @type {Attachment}
         */
        this.draggedPoint = null;
        this.dragOffset = createVector();
        this.deleteTimer = 0.0;
    }

    draw() {
        let mouse = this.workspace.mouse;
        push();
        fill(255);
        stroke(0);
        textSize(15);
        textAlign(LEFT, TOP)
        let str = "Left Click: drag/add point\nMiddle Click: delete point\nRight Click: toggle parent";
        /*
        This line was replaced by hoveredPart. I reverted that. I did so because I want to be specifically
        editing points on just one line. It makes working with overlapping points on different parts
        (something that typically happens to make sure parts line up) much easier.
        */
        if (!this.workspace.selectedPart) {
            str = "No selected part";
        } else {
            let sPart = this.workspace.selectedPart;
            let clickedAtch;
            for (let i = 0; i < sPart.attachments.length; i++) {
                let atch = sPart.attachments[i];
                let atchPos = atch.getPos();
                if (mouse.dist(atchPos) < 20) {
                    clickedAtch = atch;
                    break;
                }
            }
            if (clickedAtch) {
                str += `\nType: ${clickedAtch.type}\nParent: ${clickedAtch.parent}\nPos: (${clickedAtch.x}, ${clickedAtch.y})`
                if (pInput.middleDown()) {
                    this.deleteTimer += deltaTime/1000
                    push();
                    translate(mouse.x, mouse.y);
                    scale(1/this.workspace.zoom);
                    noStroke();
                    fill(255, 0, 0)
                    circle(0, 0, this.deleteTimer*120) // fancy circle progress bar for confirming deletion
                    noFill();
                    stroke(255, 0, 0);
                    circle(0, 0, 120); // Outer indicator circle
                    pop();
                    if (this.deleteTimer > 1) {
                        sPart.attachments.splice(sPart.attachments.indexOf(clickedAtch), 1);
                    }
                }
            } else {
                this.deleteTimer = 0
            }
        }
        if (!pInput.middleDown()) {
            this.deleteTimer = 0
        }
        translate(mouse.x, mouse.y + 50/this.workspace.zoom);
        scale(1/this.workspace.zoom);
        text(str, 0, 0);
        pop();
        if (this.draggedPoint) {
            push();
            let pos = this.draggedPoint.getPos();
            translate(pos);
            scale(1/this.workspace.zoom);
            noStroke();
            fill(255, 0, 0);
            circle(0, 0, 5);
            pop();
        }
        
    }

    update() {
        let mouse = this.workspace.mouse;
        if (this.draggedPoint) {
            console.log(`${mouse.x+this.dragOffset}`, `${mouse.y+this.dragOffset}`)
            if (!this.draggedPoint.part.hasParent()) {
                this.draggedPoint.setRelPos(mouse.x+this.dragOffset.x, mouse.y+this.dragOffset.y);
            } else {
                let pos = this.draggedPoint.getPos();
                pos.x -= mouse.x - this.workspace.pMousePos.x;
                pos.y -= mouse.y - this.workspace.pMousePos.y;
                this.draggedPoint.setRelPos(pos.x, pos.y);
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
        if (p && (button == 0 || button == 1 || button == 2)) {
            if (this.workspace.selectedPart) {
                if (!this.draggedPoint) {
                    let sPart = this.workspace.selectedPart;
                    let clickedAtch;
                    for (let i = 0; i < sPart.attachments.length; i++) {
                        let atch = sPart.attachments[i];
                        let atchPos = atch.getPos();
                        if (mouse.dist(atchPos) < 20) {
                            clickedAtch = atch;
                            break;
                        }
                    }
                    switch (button) {
                        case 0:
                            if (clickedAtch) {
                                this.draggedPoint = clickedAtch;
                                this.dragOffset.x = clickedAtch.getPos().x - mouse.x;
                                this.dragOffset.y = clickedAtch.getPos().y - mouse.y;
                                console.log(this.dragOffset);
                            } else {
                                let relPos = sPart.getRelPos(mouse.x, mouse.y)
                                let type = prompt("Enter attachment point type");
                                let newAtch = new Attachment(relPos.x, relPos.y, type, false);
                                newAtch.part = sPart;
                                sPart.attachments.push(newAtch)
                            }
                            break;
                        case 1:
                            if (clickedAtch) {
                                //sPart.attachments.splice(sPart.attachments.indexOf(clickedAtch), 1);
                            }
                            break;
                        case 2:
                            if (clickedAtch) {
                                clickedAtch.parent = !clickedAtch.parent
                            }
                            console.log("Switching!");
                            break;
                    }
            

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