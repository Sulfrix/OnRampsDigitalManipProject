/// <reference path="types/p5/global.d.ts"/>

let workspace;

let canvas;

function preload() {
}

function setup() {
  // put setup code here
  canvas = createCanvas(windowWidth, windowHeight);
  window.p5Canvas = canvas

  workspace = new Workspace();
  pInput.registerCanvas(canvas);
  pInput.registerWorkspace(workspace);
  workspace.addNode(new PNode())
  workspace.addNode(new PNode())
  workspace.nodes[1].pos.x = 200
  //music.volume(0.2);
}

function mouseClicked() {

}

function draw() {
  background(51);
  workspace.update();
  workspace.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  workspace.cacheMouseArea = null;
}