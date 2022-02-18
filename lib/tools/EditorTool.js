class EditorTool {
    constructor() {
        this.active = false;
        /**
         * @type {EditorWorkspace}
         */
        this.workspace = null;
    }

    activate() {
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }
}