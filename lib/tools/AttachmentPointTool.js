class AttachmentPointTool extends Tool {
    constructor() {
        super();
        this.name = "Attachment Points";
        /**
         * @type {Attachment}
         */
        this.draggedPoint = null;
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
                console.log(mouse.dist)
                if (mouse.dist(atchPos) < 20) {
                    clickedAtch = atch;
                    break;
                }
            }
            if (clickedAtch) {
                str += `\nType: ${clickedAtch.type}\nParent: ${clickedAtch.parent}\nPos: (${clickedAtch.x}, ${clickedAtch.y})`
            }
        }
        text(str, mouse.x, mouse.y + 50);
        pop();
    }

    update() {
        let mouse = this.workspace.mouse;
        if (this.draggedPoint) {
            this.draggedPoint.setRelPos((mouse.x), mouse.y);
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
                        console.log(mouse.dist)
                        if (mouse.dist(atchPos) < 20) {
                            clickedAtch = atch;
                            break;
                        }
                    }
                    switch (button) {
                        case 0:
                            if (clickedAtch) {
                                this.draggedPoint = clickedAtch;
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
                                sPart.attachments.splice(sPart.attachments.indexOf(clickedAtch), 1);
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