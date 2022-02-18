/// <reference path="types/global.d.ts"/>


let defaultPart = {
    name: "",
    type: "default",
    image: "",
    scale: 1,
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
    //background(51);
    background(220);
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
        partList.appendChild(createPartListItem(part, editpart));
    }
}

/**
 * 
 * @param {EditorPart} part 
 */
function createPartListItem(part, editpart) {
    let base = document.createElement("div");
    let baseLine = document.createElement("div");
    let expand = document.createElement("div");
    let name = document.createElement("span");
    name.innerHTML = part.name;
    let exportButton = document.createElement("button");
    exportButton.innerHTML = "Export";
    exportButton.addEventListener("click", () => {
        save(part.serialize(), part.name + ".json");
    })
    let expandButton = document.createElement("button");
    expandLogic(part, expand, expandButton);
    expandButton.classList.add("iconButton");
    expandButton.addEventListener("click", () => {
        part.inspectorExpanded = !part.inspectorExpanded;
        expandLogic(part, expand, expandButton);
    })
    let selectButton = document.createElement("button")
    selectButton.innerHTML = "✎";
    if (workspace.selectedPart == editpart) {
        base.classList.add("selected");
    }
    selectButton.addEventListener('click', () => {
        workspace.selectedPart = editpart;
        updatePartsList();
    })
    selectButton.classList.add("iconButton");
    selectButton.classList.add("autoMargin");
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", () => {
        workspace.parts.splice(workspace.parts.indexOf(editpart), 1);
        updatePartsList();
    })
    baseLine.appendChild(name);
    baseLine.appendChild(selectButton);
    baseLine.appendChild(expandButton);
    base.appendChild(baseLine);
    base.appendChild(expand);
    expand.appendChild(exportButton);
    expand.appendChild(deleteButton);
    base.classList.add("partListItem");
    baseLine.classList.add("partListRow")
    expand.classList.add("partListExpand");
    return base;
}

function expandLogic(part, expand, expandButton) {
    if (part.inspectorExpanded) {
        expand.classList.add("expanded");
        expandButton.innerHTML = "▲"
    } else {
        expand.classList.remove("expanded");
        expandButton.innerHTML = "▼"
    }
}
