// helper file for inputs

window.pInput = {};

pInput.mouse = [];

/**
 * @type {HTMLCanvasElement}
 */
pInput.canvas = null;

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
    });
    element.addEventListener('mouseup', (e) => {
        pInput.mouse[e.button] = false;
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
    window.mouseWheel = function (event) {
        console.log(event.delta);
        
        workspace.changeZoom(event.delta/100)
    }
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