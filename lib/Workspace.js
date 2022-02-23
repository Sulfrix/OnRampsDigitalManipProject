// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

const gridGap = 30;

class Workspace {
    constructor() {
        /**
         * @type {WorkspacePart[]}
         */
        this.parts = [];
        this.cameraCenter = createVector(0, 0);
        this.zoom = 1;
        this.scroll = 1; // seperate so rounding works better
        this.draggable = true;
        // Always use this value for the position of the mouse in a workspace, it will be filtered through camera transform,
        // zoom, etc.
        this.mousePos = createVector();
        this.pMousePos = createVector();

        this.zoomTextTimer = 0;
    }

    draw(drawAttachments = false) {
        push();
        this.doCameraTransform();
        this.drawGrid();
        for (let part of this.parts) {
            part.draw(drawAttachments);
        }
        pop();
        push(); 
        textSize(60);
        textAlign(LEFT, TOP);
        fill(255, map(this.zoomTextTimer, 0, 1, 0, 200, true));
        text(this.zoom + "x", 10, 10);
        if (this.zoomTextTimer > 0) {
            let time = deltaTime / 1000;
            this.zoomTextTimer -= time;
        } else {
            this.zoomTextTimer = 0;
        }
        pop();
    }

    doCameraTransform() {
        translate(width/2, height/2);
        scale(this.zoom);
        translate(p5.Vector.mult(this.cameraCenter, -1));
    }

    drawGrid() {
        let gridGapUse = gridGap;
        let gridStartX = floor((this.cameraCenter.x - floor(width/this.zoom/2))/gridGapUse)*gridGapUse;
        let gridStartY = floor((this.cameraCenter.y - floor(height/this.zoom/2))/gridGapUse)*gridGapUse;
        let gridHeight = ceil((height+gridGapUse*this.zoom)/gridGapUse/this.zoom)+1;
        let gridWidth = ceil((width+gridGapUse*this.zoom)/gridGapUse/this.zoom)+1;
        let gridCount = gridHeight*gridWidth;
        push();
        noStroke();
        fill(0, 60);
        // if there are too many dots, disable render
        if (gridCount < 3000) {
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    let posX = (x*gridGapUse)+gridStartX;
                    let posY = (y*gridGapUse)+gridStartY;
                    circle(posX, posY, 3);
                }
            }
        }
        pop();
    }

    update() {
        this.mousePos = this.calcMouse(mouseX, mouseY);
        if (pInput.rightDown()) {
            let mousePos = createVector(mouseX, mouseY);
            let pMousePos = createVector(pmouseX, pmouseY)
            let diff = p5.Vector.sub(pMousePos, mousePos);
            diff.div(this.zoom);
            this.cameraCenter.add(diff);
        }
        this.pMousePos = this.mousePos.copy();
    }

    calcMouse(x, y) {
        return createVector(((x-(width/2))/this.zoom)+this.cameraCenter.x, ((y-(height/2))/this.zoom)+this.cameraCenter.y)
    }

    changeZoom(zoom) {
        let center = this.calcMouse(mouseX, mouseY);
        this.scroll += zoom*this.scroll;

        if (this.scroll < 0.2) {
            this.scroll = 0.2;
        }
        if (this.scroll > 5) {
            this.scroll = 5;
        }
        this.zoom = Math.round(this.scroll*20)/20;
        if (abs(this.scroll-1) <= 0.05) {
            this.zoom = 1;
        }
        let newCenter = this.calcMouse(mouseX, mouseY)
        let diff = p5.Vector.sub(center, newCenter);
        this.cameraCenter.add(diff);
        this.zoomTextTimer = 1;
    }
}

class EditorWorkspace extends Workspace {
    constructor() {
        super();
        /**
         * @type {EditorPart[]}
         */
        this.parts = [];
        // redeclaration of parts so IntelliSense plays nicely

        /**
         * @type {EditorPart}
         */
        this.selectedPart = null;
        /**
         * @type {EditorTool[]}
         */
        this.tools = [];
        /**
         * @type {EditorTool}
         */
        this.selectedTool = null;
    }

    draw() {
        super.draw(true);
        if (this.selectedPart) {
            push();
            this.doCameraTransform();
            noFill();
            strokeWeight(3);
            stroke(255, 246, 114);
            translate(this.selectedPart.x, this.selectedPart.y);
            rotate(this.selectedPart.rot);
            rect(this.selectedPart.width/-2, this.selectedPart.height/-2, this.selectedPart.width, this.selectedPart.height);
            pop();
        }
    }

    addTool(tool) {
        this.tools.push(tool);
        tool.workspace = this;
    }

    selectTool(tool) {
        if (!this.tools.indexOf(tool) == -1) {
            throw new Error("EditorWorkspace: attempted to select a part that was not in the tools list!")
        }
        if (this.selectedTool) {
            this.selectedTool.deactivate();
        }
        tool.activate();
        this.selectedTool = tool;
    }

    deselectTool() {
        if (this.selectedTool) {
            this.selectedTool.deactivate();
            this.selectedTool = null;
        }
    }
}