/// <reference path="types/global.d.ts"/>

let workspace;

let canvas;

function setup() {
  // put setup code here
  canvas = createCanvas(windowWidth, windowHeight);
  workspace = new Workspace();
  pInput.registerCanvas(canvas);
  pInput.registerWorkspace(workspace);
}

function draw() {
  background(220);
  workspace.update();
  workspace.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
