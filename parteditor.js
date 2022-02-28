/// <reference path="types/global.d.ts"/>


let defaultPart = {
    name: "",
    type: "default",
    image: "",
    scale: 1,
    attachments: []
}

let categories = {};

/**
 * @type {EditorWorkspace}
 */
let workspace;

let canvas;

function preload() {
    categories = loadJSON("categories.json");
}

function setup() {
    // put setup code here
    canvas = createCanvas(windowWidth - 260, windowHeight - 40);
    workspace = new EditorWorkspace();
    pInput.registerCanvas(canvas);
    pInput.registerWorkspace(workspace);
    workspace.addTool(new EditorCursorTool());
    workspace.addTool(new Tool());
    workspace.selectTool(workspace.tools[0]);
    refreshTools();
}

function draw() {
    // put drawing code here
    //background(51);
    background(220);
    workspace.update();
    workspace.draw();
}

function windowResized() {
    resizeCanvas(windowWidth - 260, windowHeight - 40);
}

function newPartButton() {
    openDialog("newDialog");
}

function newPart() {
    let name = document.getElementById("partName").value;
    let type = document.getElementById("partType").value;
    let image = document.getElementById("partImage").value;
    newPart.name = name;
    newPart.type = type;
    newPart.image = image;
    let instPart = new Part(newPart);
    let workPart = new EditorPart(0, 0, instPart);
    workspace.addPart(workPart);
    updatePartsList();
}

function refreshTools() {
    let toolPicker = document.getElementById("tool-picker");
    toolPicker.innerHTML = "";
    for (let tool of workspace.tools) {
        let button = document.createElement("button");
        button.innerHTML = tool.name;
        if (tool == workspace.selectedTool) {
            button.classList.add("active");
        }
        button.addEventListener("click", () => {
            workspace.selectTool(tool);
            refreshTools();
        })
        toolPicker.appendChild(button);
    }
}

let currentDialog = null;

function openDialog(which) {
    if (currentDialog) {
        closeDialog();
    }
    document.getElementById("dialogOverlay").classList.remove("hidden");
    document.getElementById(which).classList.remove("hidden");
    currentDialog = which;
}

function closeDialog() {
    if (currentDialog) {
        document.getElementById("dialogOverlay").classList.add("hidden");
        document.getElementById(currentDialog).classList.add("hidden");
        currentDialog = null;
    }
}

function loadPart() {
    openDialog("loadDialog");
    let list = document.getElementById("partLoadList");
    list.innerHTML = "";
    console.log("File list opened");
    for (let cat in categories) {
        let catList = categories[cat];
        let categoryElement = createCategoryElement(cat, catList);
        list.appendChild(categoryElement);

    }
}

function loadButton() {
    let input = document.getElementById("fileURL");
    pathLoad(input.value)
}

function createCategoryElement(cat, catList) {
    let input = document.getElementById("fileURL");
    console.log(`Generating file folder ${cat}`);
    let base = document.createElement("div");
    base.classList.add("fileCategory");
    let title = document.createElement("div");
    title.classList.add("title")
    title.innerHTML = cat;
    base.appendChild(title);
    let expandButton = document.createElement("button");
    expandButton.classList.add("iconButton");
    expandButton.innerHTML = "▼"
    title.prepend(expandButton);
    let files = document.createElement("div");
    expandButton.addEventListener('click', () => {
        if (files.classList.contains("hidden")) {
            expandButton.innerHTML = "▼";
            files.classList.remove("hidden")
        } else {
            expandButton.innerHTML = "▲"
            files.classList.add("hidden")
        }
    })
    files.classList.add("files");
    for (let file of catList) {
        let fileEle = document.createElement("div");
        fileEle.innerHTML = file;
        fileEle.addEventListener('click', () => {
            input.value = file;
        })
        files.appendChild(fileEle);
    }
    base.appendChild(files);
    return base;
}

function pathLoad(path) {
    loadJSON(path, {}, "json", (data) => {
        workspace.addPart(new EditorPart(0, 0, new Part(data)));
        updatePartsList();
        document.getElementById("fileURL").value = "";
        closeDialog();
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
        if(workspace.selectedPart == editpart){
            workspace.selectedPart = null;
        }
        else{
            workspace.selectedPart = editpart;
        }
        updatePartsList();
    })
    selectButton.classList.add("iconButton");
    selectButton.classList.add("autoMargin");
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", () => {
        workspace.deletePart(editpart);
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
