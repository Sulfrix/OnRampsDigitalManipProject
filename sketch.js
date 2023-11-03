/// <reference path="types/p5/global.d.ts"/>

let workspace;

let canvas;

function preload() {
}

function setup() {
  // put setup code here
  canvas = createCanvas(windowWidth, windowHeight);

  workspace = new Workspace();
  pInput.registerCanvas(canvas);
  pInput.registerWorkspace(workspace);
  //music.volume(0.2);
}

function mouseClicked() {

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