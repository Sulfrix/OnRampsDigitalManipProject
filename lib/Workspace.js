// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

class Workspace {
    constructor() {
        /**
         * @type {WorkspacePart[]}
         */
        this.parts = [];
        this.cameraCenter = createVector(0, 0);
        this.zoom = 2;
        this.draggable = true;
        // Always use this value for the position of the mouse in a workspace, it will be filtered through camera transform,
        // zoom, etc.
        this.mousePos = createVector();
        this.pMousePos = createVector();
    }

    draw() {
        push();
        translate(width/2, height/2);
        scale(this.zoom);
        translate(p5.Vector.mult(this.cameraCenter, -1));
        for (let part of this.parts) {
            part.draw();
        }
        circle(this.mousePos.x, this.mousePos.y, 10);
        pop();
    }

    update() {
        this.mousePos.x = ((mouseX-(width/2))/this.zoom)+this.cameraCenter.x;
        this.mousePos.y = ((mouseY-(height/2))/this.zoom)+this.cameraCenter.y;
        if (pInput.rightDown()) {
            let mousePos = createVector(mouseX, mouseY);
            let pMousePos = createVector(pmouseX, pmouseY)
            let diff = p5.Vector.sub(pMousePos, mousePos);
            diff.div(this.zoom);
            this.cameraCenter.add(diff);
        }
        this.pMousePos = this.mousePos.copy();
    }

    changeZoom(zoom) {
        this.zoom += zoom;
        if (this.zoom < 0.1) {
            this.zoom = 0.1;
        }

        if (this.zoom > 5) {
            this.zoom = 5;
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
    }
}