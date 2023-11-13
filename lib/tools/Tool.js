class Tool {
    constructor() {
        this.active = false;
        /**
         * @type {Workspace}
         */
        this.workspace = null;
        this.name = "Blank Tool";
        this.lockSelection = true;
    }

    update() {
        // This better be called with super.update() in any tools or else stuff will not work!
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
	 * Extra event handler for mouse motion.
	 * @param {MouseEvent} e 
	 */
	mouseMove(e) { }
}