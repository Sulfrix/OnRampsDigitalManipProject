// helper file for inputs

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
pInput.registerCanvas = function (canvas) {
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
    element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    })
    pInput.canvas = element;
}


/**
 * 
 * @param {Workspace} workspace 
 */
pInput.registerWorkspace = function (workspace) {
    /**
     * 
     * @param {WheelEvent} event 
     */
    window.mouseWheel = function (event) {
        //console.log(event);
        if (event.path.includes(pInput.canvas)) {
            if (workspace.mouseArea.pointIntersects(mouseX, mouseY)) {
                workspace.changeZoom(event.delta/-500)
            } else {
                workspace.doScroll(event.delta);
            }
        }
        event.preventDefault();
    }
    pInput.workspace = workspace;
}

pInput.leftDown = function () {
    return pInput.mouse[0];
}

pInput.middleDown = function () {
    return pInput.mouse[1];
}

pInput.rightDown = function () {
    return pInput.mouse[2];
}