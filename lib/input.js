// This file is placed outside of other components so input can be unified.
// It uses base JavaScript definitions of events as I felt the p5.js ones were inadequate (no MouseEvent object passed into events)

window.pInput = {};

pInput.mouse = [];

/**
 * @type {HTMLCanvasElement}
 */
pInput.canvas = null;

/**
 * @type {Workspace}
 */
pInput.workspace = null;

/**
 * 
 * @param {p5.Renderer} canvas 
 */
pInput.registerCanvas = function (canvas) { // So we know what to hook events to
    /**
     * @type {HTMLCanvasElement}
     */
    let element = canvas.elt;
    element.addEventListener('mousedown', (e) => {
        pInput.mouse[e.button] = true;
        if (pInput.workspace) {
            pInput.workspace.mouseEvent(true, e.button, e);
        }
    });
    element.addEventListener('mouseup', (e) => {
        pInput.mouse[e.button] = false;
        if (pInput.workspace) {
            pInput.workspace.mouseEvent(false, e.button, e);
        }
    });
    element.addEventListener('contextmenu', (e) => { // The right click menu is disabled
        e.preventDefault();
    })
    window.keyTyped = (e) => {
        if (pInput.workspace) {
            pInput.workspace.keyEvent(e.key, e);
        }
    }
    pInput.canvas = element;
}


/**
 * 
 * @param {Workspace} workspace 
 */
pInput.registerWorkspace = function (workspace) { // So we know what Workspace to send events to
    /**
     * 
     * @param {WheelEvent} event 
     */
    window.mouseWheel = function (event) {
        //console.log(event);
        if (event.path.includes(pInput.canvas)) {
            if (workspace.validMousePoint(mouseX, mouseY)) {
                workspace.changeZoom(event.delta/-500) // If the mouse is inthe workspace area, zoom, else scroll the parts list
            } else {
                workspace.doScroll(event.delta);
            }
        }
    }
    pInput.workspace = workspace;
}

// Keeps track if buttons are held
pInput.leftDown = function () {
    return pInput.mouse[0];
}

pInput.middleDown = function () {
    return pInput.mouse[1];
}

pInput.rightDown = function () {
    return pInput.mouse[2];
}