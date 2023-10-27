class Tool {
    constructor() {
        this.active = false;
        /**
         * @type {Workspace}
         */
        this.workspace = null;
        this.hoverCache = null;
        this.name = "Blank Tool";
    }

    update() {
        //This better be called with super.update() in any tools or else stuff will not work!
        this.hoverCache = null;
    }

    draw() {
        let mouse = this.workspace.mouse;
        circle(mouse.x, mouse.y, 20);
    }

    activate() {
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
    mouseEvent(p, button, e) { }

    /**
     * @returns {WorkspacePart}
     */
    get hoveredPart() {
        if (!this.hoverCache) {
            let mouse = this.workspace.mouse;
            if (this.workspace) {
                for (let index = this.workspace.orderedParts.length-1; index >= 0; index--) {
                    let part = this.workspace.parts[this.workspace.orderedParts[index]];
                    if (part.boundingBox.pointIntersects(mouse.x, mouse.y)) {
                        return part;
                    }
                }
            }
        } else {
            return this.hoverCache;
        }
    }
}