// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

const gridGap = 30;

class Workspace {
    constructor() {
        /**
         * @type {WorkspacePart[]}
         */
        this.parts = [];
        this.orderedParts = [];
        this.cameraCenter = createVector(0, 0);
        this.zoom = 1;
        this.scroll = 1; // seperate so rounding works better
        this.draggable = true;
        // Always use this value for the position of the mouse in a workspace, it will be filtered through camera transform,
        // zoom, etc.
        this.mousePos = createVector();
        this.pMousePos = createVector();

        this.zoomTextTimer = 0;

        this.cacheMouseArea = null;


        /**
         * @type {WorkspacePart}
         */
         this.selectedPart = null;

        /**
         * @type {Tool[]}
         */
         this.tools = [];
         /**
          * @type {Tool}
          */
         this.selectedTool = null;
    }

    get mouseArea() {
        if (!this.cacheMouseArea) {
            this.cacheMouseArea = new BoundingBox(createVector(width/2, height/2), width, height, 0);
        }
        return this.cacheMouseArea;
    }
    
    addPart(part) {
        this.orderedParts.push(this.parts.length);
        this.parts.push(part);
        part.workspace = this;
    }

    removePart(part) {
        let index = this.parts.indexOf(part);
        this.parts.splice(index, 1);
        this.orderedParts.splice(this.orderedParts.indexOf(index), 1);
        part.workspace = null;
    }

    draw(drawAttachments = false) {
        push();
        this.doCameraTransform();
        this.drawGrid();
        for (let i of this.orderedParts) {
            this.parts[i].draw(drawAttachments);
        }
        this.drawTool();
        pop();
        push(); 
        textSize(60);
        textAlign(LEFT, TOP);
        fill(255, map(this.zoomTextTimer, 0, 1, 0, 200, true));
        text(this.zoom + "x", this.mouseArea.pos.x-(this.mouseArea.width/2)+10, 10);
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
        if (pInput.rightDown() && this.mouseArea.pointIntersects(mouseX, mouseY)) {
            let mousePos = createVector(mouseX, mouseY);
            let pMousePos = createVector(pmouseX, pmouseY);
            let diff = p5.Vector.sub(pMousePos, mousePos);
            diff.div(this.zoom);
            this.cameraCenter.add(diff);
        }
        this.updateTool();
        for (let p of this.parts) {
            p.update();
        }
        this.pMousePos = this.mousePos.copy();
    }

    updateTool() {
        if (this.selectedTool) {
            this.selectedTool.update();
        }
    }

    drawTool() {
        if (this.selectedTool) {
            this.selectedTool.draw();
        }
    }

    calcMouse(x, y) {
        return createVector(((x-(width/2))/this.zoom)+this.cameraCenter.x, ((y-(height/2))/this.zoom)+this.cameraCenter.y)
    }

    get mouse() {
        return this.calcMouse(mouseX, mouseY);
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

    doScroll(amt) {}

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

    selectPart(part) {
        this.selectedPart = part;
        let index = this.parts.indexOf(part);
        let index2 = this.orderedParts.indexOf(index);
        this.orderedParts.splice(index2, 1);
        this.orderedParts.push(index);
    }

    deletePart(part){
        let index = this.parts.indexOf(part);
        let index2 = this.orderedParts.indexOf(index);
        this.orderedParts.splice(index2, 1);
        for(let i in this.orderedParts){
            if(this.orderedParts[i] > index){
                this.orderedParts[i]--;
            }
        }
        this.parts.splice(index, 1);
    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) {
        if (this.selectedTool && (this.mouseArea.pointIntersects(mouseX, mouseY) || !p)) {
            this.selectedTool.mouseEvent(p, button, e)
        }
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
    }

    draw() {
        super.draw(true);
        if (this.selectedPart) {
            push();
            this.doCameraTransform();
            noFill();
            strokeWeight(3);
            stroke(255, 246, 114);
            this.selectedPart.boundingBox.drawRect();
            pop();
        }
    }
}