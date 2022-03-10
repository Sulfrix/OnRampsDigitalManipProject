/// <reference path="types/global.d.ts"/>

let workspace;

let canvas;

let categories;

let helpEle;

function preload() {
  categories = loadJSON("categories.json");
}

function setup() {
  // put setup code here
  canvas = createCanvas(windowWidth, windowHeight);
  workspace = new FrontEndWorkspace();
  pInput.registerCanvas(canvas);
  pInput.registerWorkspace(workspace);
  workspace.addTool(new HandTool());
  workspace.selectTool(workspace.tools[0]);
}

function draw() {
  background(220);
  workspace.update();
  workspace.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  workspace.cacheMouseArea = null;
}

function openHelp() {
  helpEle = document.createElement("iframe");
  helpEle.src = "helppage.html";
  document.body.appendChild(helpEle);
}

window.addEventListener("message", (e) => {
  if (e.data == "closeMePlease") {
    helpEle.remove();
    helpEle = null;
  }
})