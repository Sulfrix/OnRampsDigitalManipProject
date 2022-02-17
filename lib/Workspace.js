// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

class Workspace {
    constructor() {
        /**
         * @type {WorkspacePart[]}
         */
        this.parts = [];
        this.cameraCenter = createVector(0, 0);
        this.zoom = 1;
    }

    draw() {
        push();
        translate(this.cameraCenter);
        translate(width/2, height/2);
        for (let part of this.parts) {
            part.draw();
        }
        pop();
    }

    update() {
        
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