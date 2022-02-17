/// <reference path="types/global.d.ts"/>


let defaultPart = {
    name: "",
    type: "default",
    image: "",
    attachments: []
}

/**
 * @type {EditorWorkspace}
 */
let workspace;

let canvas;

function setup() {
    // put setup code here
    canvas = createCanvas(windowWidth - 260, windowHeight - 20);
    workspace = new EditorWorkspace();
    pInput.registerCanvas(canvas);
    pInput.registerWorkspace(workspace);
}

function draw() {
    // put drawing code here
    background(51);
    workspace.update();
    workspace.draw();
}

function windowResized() {
    resizeCanvas(windowWidth - 260, windowHeight - 20);
}

function newPart() {
    let name = prompt("Enter a name for the part.");
    let type = prompt("Enter the part's type.");
    let image = prompt("Enter an image path for the part.");
    let newPart = Object.assign({}, defaultPart);
    newPart.name = name;
    newPart.type = type;
    newPart.image = image;
    let instPart = new Part(newPart);
    let workPart = new EditorPart(0, 0, instPart);
    workspace.parts.push(workPart);
    updatePartsList();
}

function loadPart() {
    let path = prompt("Enter the URL path to a part JSON file.");
    pathLoad(path)
}

function pathLoad(path) {
    loadJSON(path, {}, "json", (data) => {
        workspace.parts.push(new EditorPart(0, 0, new Part(data)));
        updatePartsList();
    });
}

function updatePartsList() {
    let partList = document.getElementById("partList");
    partList.innerHTML = "";
    for (let editpart of workspace.parts) {
        let part = editpart.part;
        partList.appendChild(createPartListItem(part));
    }
}

/**
 * 
 * @param {Part} part 
 */
function createPartListItem(part) {
    let base = document.createElement("div");
    let name = document.createElement("span");
    name.innerHTML = part.name;
    let exportButton = document.createElement("button");
    exportButton.innerHTML = "Export";
    exportButton.addEventListener("click", () => {
        save(part.serialize(), part.name + ".json");
    })
    base.appendChild(name);
    base.appendChild(exportButton);
    base.classList.add("partListItem");
    return base;
}
