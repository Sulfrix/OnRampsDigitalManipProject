class Tool {
    constructor() {
        this.active = false;
        /**
         * @type {Workspace}
         */
        this.workspace = null;
        this.name = "Blank Tool";
        this.lockSelection = true;
        /**
         * @type {Tool}
         */
        this.handoffSender = null;
    }

    /**
     * Switch to another tool of a certain type, passing data.
     * @param {typeof Tool} type The type of the tool to handoff to
     * @param {Object} data Any data that the other tool will need
     * @returns {Tool} The tool that was handed off to, null if tool not found
     */
    handoffTool(type, data) {
        for (let tool of this.workspace.tools) {
            if (tool instanceof type) {
                this.workspace.selectTool(tool)
                tool.handoffSender = this;
                tool.recieveHandoff(data)
                return tool
            }
        }
        return null
    }

    /**
     * Called when this tool recieves handoff data.
     * @param {Object} data 
     */
    recieveHandoff(data) {}

    handback() {
        if (this.handoffSender) {
            this.workspace.selectTool(this.handoffSender)
            this.handoffSender.recieveHandoff()
            this.handoffSender = null
        } else {
            this.handoffTool(SelectionTool) // Return to the selection tool by default
        }
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