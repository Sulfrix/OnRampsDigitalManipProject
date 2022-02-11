/// <reference path="types/global.d.ts"/>

function setup() {
  // put setup code here
  createCanvas(400, 300);
}

function draw() {
  // put drawing code here
  background(51);
  circle(mouseX, mouseY, 10);
  text("Goodbye World!", 0, 10);
}
