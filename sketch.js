/// <reference path="types/p5/global.d.ts"/>


let workspace;

let canvas;

let categories;

let helpEle;

let sounds;

let music;

let musicPlaying = false;

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
  //music.volume(0.2);
}

function mouseClicked() {
  /*if (!musicPlaying) {
    music.loop();
    musicPlaying = true;
  }*/
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
  if (!helpEle) {
    helpEle = document.createElement("iframe");
  helpEle.src = "helppage.html";
  document.body.appendChild(helpEle);
  }
}

window.addEventListener("message", (e) => {
  if (e.data == "closeMePlease") {
    helpEle.remove();
    helpEle = null;
  }
})

let audioCache = {};
