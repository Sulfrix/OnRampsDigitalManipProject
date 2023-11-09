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
	workspace.addTool(new SelectionTool())
	workspace.addTool(new MoveTool())
	workspace.addTool(new RotateTool())
	workspace.addTool(new ScaleTool())
	workspace.selectTool(workspace.tools[0])
	for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 2; y++) {
			let node = new PNode()
			node.pos.x = x*300
			node.pos.y = y*300
			workspace.addNode(node)
		}
	}
	//textFont(arial)
	//music.volume(0.2);
}

var frameTimes = []

function mouseClicked() {

}

function draw() {
	background(51);
	var startTime = performance.now()
	workspace.update();
	workspace.draw();
	var endTime = performance.now()
	var frameTime = endTime - startTime
	frameTimes.push(frameTime)
	if (frameTimes.length > 30) {
		frameTimes.shift()
	}
	var sum = 0
	for (let t of frameTimes) {
		sum += t
	}
	var avgFrameTime = sum/frameTimes.length
	fill(255)
	text((Math.round(avgFrameTime*100) / 100) + "ms", 10, 20)
	perfGraph(avgFrameTime)
}

function perfGraph(avg) {
	push()
	noStroke()
	fill(255, 128)
	let s = 4
	for (let i = 0; i < frameTimes.length; i++) {
		var t = frameTimes[i]
		rect(i*s, 0, s, t*10)
	}
	noFill()
	stroke(255)
	line(0, avg*10, frameTimes.length*s, avg*10)
	pop()
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	workspace.cacheMouseArea = null;
}