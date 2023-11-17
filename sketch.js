/// <reference path="types/p5/global.d.ts"/>

let workspace;

let canvas;

let perfGraph

function preload() {}

function workspaceTemplate() {
	return Workspace.newFromTemplate()
}

function switchWorkspace(wspc) {
	workspace = wspc;
	pInput.registerWorkspace(workspace);
}

function setup() {
	// put setup code here
	canvas = createCanvas(windowWidth, windowHeight);
	window.p5Canvas = canvas;

	workspace = workspaceTemplate()
	switchWorkspace(workspace)
	PerfTrack.enableTracking()
	console.log(PerfTrack.measure("Create Test Nodes", () => {
		for (let x = 0; x < 2; x++) {
			for (let y = 0; y < 1; y++) {
				let node = new PNode();
				node.pos.x = x * 300;
				node.pos.y = y * 300;
				workspace.addNode(node);
			}
		}
	}))
	pInput.registerCanvas(canvas);
	
	
	
	perfGraph = new PerfGraph();
	//textFont(arial)
	//music.volume(0.2);
}

var frameTimes = [];

function mouseClicked() {}

var debugScale = false
var prevPerfTrack = null

var displayedTrack = null

function draw() {
	PerfTrack.push("Main Loop")
	PerfTrack.push("Work")
	background(51);
	if (debugScale) {
		scale(0.5)
		translate(width/2, height/2)
		push()
		noFill()
		stroke(255)
		rect(0, 0, width, height)
		pop()
	}
	//workspace.screenArea.rot += 0.08*deltaTime/1000
	workspace.update();
	workspace.draw();
	PerfTrack.pop();
	var loop = PerfTrack.pop()
	if (perfGraph && loop) {
		//loop.endTime = loop.startTime + 16
		perfGraph.recordTime(loop.getLength());
		perfGraph.drawGraph(true)
		if (frameCount % 5 == 0 || !displayedTrack) {
			displayedTrack = loop
		}
		displayedTrack.display(50, height-20, width-100, 0)
	}
	prevPerfTrack = loop
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	workspace.cacheMouseArea = null;
}
