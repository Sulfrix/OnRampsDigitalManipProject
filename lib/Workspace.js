// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

const gridGap = 25;

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

    draw() {
        push();
        translate(width/2, height/2);
        scale(this.zoom);
        translate(p5.Vector.mult(this.cameraCenter, -1));
        this.drawGrid();
        for (let part of this.parts) {
            part.draw();
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

    drawGrid() {
        let gridStartX = floor((this.cameraCenter.x - floor(width/this.zoom/2))/gridGap)*gridGap;
        let gridStartY = floor((this.cameraCenter.y - floor(height/this.zoom/2))/gridGap)*gridGap;
        push();
        noStroke();
        fill(255, 60);
        if (this.zoom > 0.8) {
            for (let y = 0; y < ceil((height+gridGap*this.zoom)/gridGap/this.zoom)+1; y++) {
                for (let x = 0; x < ceil((width+gridGap*this.zoom)/gridGap/this.zoom)+1; x++) {
                    let posX = (x*gridGap)+gridStartX;
                    let posY = (y*gridGap)+gridStartY;
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
        this.scroll += zoom;
        if (this.scroll < 0.2) {
            this.scroll = 0.2;
        }
        if (this.scroll > 5) {
            this.scroll = 5;
        }
        this.zoom = Math.round(this.scroll*20)/20;
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
    }
}