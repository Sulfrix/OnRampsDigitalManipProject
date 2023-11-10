// Unified "workspace" class for most of the UI in our app.
// Has dragging zooming, part manipulation, drawing

const gridGap = 30;

class Workspace {
	constructor() {

		/**
		 * @type {Array<PNode>}
		 */
		this.nodes = []
		/**
		 * @type {PNode[]}
		 */
		this.selectedNodes = []
		this.cameraCenter = createVector(0, 0);
		this.zoom = 1;
		this.scroll = 1; // seperate so rounding works better
		this.lineGrid = true; // Render a faster but uglier line grid instead of a dot grid
		this.screenArea = new BoundingBox(createVector(0, 0), width, height)

		// Always use this value for the position of the mouse in a workspace, it will be filtered through camera transform,
		// zoom, etc.
		this.mousePos = createVector();
		this.pMousePos = createVector(); // The position of the mouse the previous frame, useful for getting motion

		this.zoomTextTimer = 0;

		this.cacheMouseArea = null; // Hold the mouseArea value every frame so it is not calculated more than once per frame (more than the values can change)

		/**
		 * @type {OverlayButton[]}
		 */
		this.buttons = [];


		this.shouldClick = null;


		/**
		 * @type {Tool[]}
		 */
		this.tools = []; // Used mostly in the part editor but in the actual app it is redundant to be an array
		/**
		 * @type {Tool}
		 */
		this.selectedTool = null; // The tool we're using.

		/**
		 * @type {ParticleEffect[]}
		 */
		this.particles = []; // Even though there is a clean inheritence-based implementation of particles, the only one is the circle effect when attaching parts.
		this.populateButtons()
	}

	populateButtons() {
		this.buttons.push(new OverlayButton("✋", "Move Nodes", () => {
			let i = this.tools.findIndex((v) => { return v instanceof MoveTool })
			if (i == -1) {
				console.log("Error: can't find move tool")
				return
			}
			this.selectTool(this.tools[i])
		}, 50, "g"))
		this.buttons.push(new OverlayButton("🔃", "Rotate Nodes", () => {
			let i = this.tools.findIndex((v) => { return v instanceof RotateTool })
			if (i == -1) {
				console.log("Error: can't find rotate tool")
				return
			}
			this.selectTool(this.tools[i])
		}, 50, "r"))
		this.buttons.push(new OverlayButton("📏", "Scale Nodes", () => {
			let i = this.tools.findIndex((v) => { return v instanceof ScaleTool })
			if (i == -1) {
				console.log("Error: can't find scale tool")
				return
			}
			this.selectTool(this.tools[i])
		}, 50, "s"))
		this.buttons.push(new OverlayButton("A", "Select All", () => { this.selectedNodes = this.nodes }, 50, "a"))
	}

	set selectedNodes(value) {
		if (this.selectedTool && this.selectedTool.lockSelection) {
			console.log("TODO: node selection attempted to change while using tool with locked selection")
			return
		}
		this._selectedNodes = value
	}

	get selectedNodes() {
		return this._selectedNodes
	}


	addNode(node) {
		node.workspace = this
		this.nodes.push(node)
	}

	get mouseArea() { // This is the area of the workspace that counts as "onscreen." This was created to account for the sidebar in our app.
		if (!this.cacheMouseArea) {
			this.cacheMouseArea = new BoundingBox(createVector(width / 2, height / 2), width, height, 0);
		}
		return this.cacheMouseArea;
	}

	invalidateMouseArea() {
		this.cacheMouseArea = null
	}

	draw() {
		this.screenArea.pos = this.cameraCenter
		this.screenArea.width = width / this.zoom
		this.screenArea.height = height / this.zoom
		push();
		this.doCameraTransform(); // Transform to "workspace" coordinates
		this.drawGrid();
		// Draw nodes here
		for (let node of this.nodes) {
			if (BoundingBox.boxesIntersect(this.screenArea, node.boundingBox)) {
				node.draw()
			}
		}
		this.drawParticles();
		this.drawTool(); // In our part editor, tools could draw a visual indicator on them. This is unused otherwise.
		pop();
		push(); // This draws the current zoom level in the top left of the screen (2x, 1x, 3.55x, etc.)
		textSize(60);
		textAlign(LEFT, TOP);
		fill(255, map(this.zoomTextTimer, 0, 1, 0, 200, true));
		text((Math.round(this.zoom * 20) / 20) + "x", this.mouseArea.pos.x - (this.mouseArea.width / 2) + 10, 10);
		if (this.zoomTextTimer > 0) {
			let time = deltaTime / 1000;
			this.zoomTextTimer -= time;
		} else {
			this.zoomTextTimer = 0;
		}
		pop();

		this.drawButtons(); // Draw the circular buttons in the bottom left corner.
	}

	drawButtons() {
		if (this.buttons.length > 0) {
			let mA = this.mouseArea;
			let edgePadding = 15;
			let buttonPadding = 7;
			push();
			let cornerX = mA.pos.x - (mA.width / 2) + edgePadding;
			let cornerY = mA.pos.y + (mA.height / 2) - edgePadding;
			let offsetY = cornerY;
			for (let i of this.buttons) {
				i.pos.x = cornerX - ((i.rad * 1.5) * (1 - i.slide));
				i.pos.y = offsetY;
				let size = i.draw();
				offsetY -= size + (buttonPadding * i.slide);
			}
			pop();
		}

	}

	drawParticles() {
		for (let p of this.particles) {
			p.draw();
		}
	}

	doCameraTransform() {
		translate(width / 2, height / 2);
		scale(this.zoom);
		translate(p5.Vector.mult(this.cameraCenter, -1));
	}

	drawGrid() {

		let gridGapUse = gridGap; //space between grid points, re-referenced here because in development I wanted to have dynamic grid sizes
		if (this.lineGrid) {
			if (this.zoom <= 0.5) {
				gridGapUse *= 2
			}
		}
		let gridStartX = floor((this.cameraCenter.x - floor(width / this.zoom / 2)) / gridGapUse) * gridGapUse;
		let gridStartY = floor((this.cameraCenter.y - floor(height / this.zoom / 2)) / gridGapUse) * gridGapUse;
		let gridHeight = ceil((height + gridGapUse * this.zoom) / gridGapUse / this.zoom) + 1;
		let gridWidth = ceil((width + gridGapUse * this.zoom) / gridGapUse / this.zoom) + 1;
		push();
		if (!this.lineGrid) {
			let gridCount = gridHeight * gridWidth;
			noStroke();
			fill(0, 60);
			// if there are too many dots, disable render
			if (gridCount < 3000) {
				for (let y = 0; y < gridHeight; y++) {
					for (let x = 0; x < gridWidth; x++) {
						let posX = (x * gridGapUse) + gridStartX;
						let posY = (y * gridGapUse) + gridStartY;
						circle(posX, posY, 3);
						//point(posX, posY)
					}
				}
			}
		} else {
			stroke(40);
			//strokeWeight(1/this.zoom);
			strokeWeight(2);
			noSmooth()
			strokeCap(SQUARE)
			for (let y = 0; y < gridHeight; y++) {
				let x = 0;
				let posX = Math.round((x * gridGapUse) + gridStartX);
				let posY = Math.round((y * gridGapUse) + gridStartY);
				line(posX, posY, posX + (width / this.zoom) + gridGapUse, posY)
			}
			for (let x = 0; x < gridWidth; x++) {
				let y = 0;
				let posX = Math.round((x * gridGapUse) + gridStartX);
				let posY = Math.round((y * gridGapUse) + gridStartY);
				line(posX, posY, posX, posY + (height / this.zoom) + gridGapUse)
			}
		}
		pop();
	}


	update() {
		this.mousePos = this.calcMouse(mouseX, mouseY); // converts the screenspace mouse position into a workspace mouse position
		if ((pInput.rightDown() || pInput.middleDown()) && this.validMousePoint(mouseX, mouseY)) { // drag the screen
			let mousePos = createVector(mouseX, mouseY);
			let pMousePos = createVector(pmouseX, pmouseY);
			let diff = p5.Vector.sub(pMousePos, mousePos);
			diff.div(this.zoom);
			this.cameraCenter.add(diff);
		}
		this.updateTool(); // updates tool, very important for the Hand tool

		// Update nodes here

		this.updateParticles();
		this.pMousePos = this.mousePos.copy();

		// TODO: Don't do this in update
		if (this.selectedTool instanceof SelectionTool) {
			this.buttons.forEach((v) => {v.targetSlide = 1})
		} else {
			this.buttons.forEach((v) => {v.targetSlide = 0})
		}
	}

	updateParticles() {
		for (let i = 0; i < this.particles.length; i++) {
			let p = this.particles[i];
			p.update();
			if (p.shouldDelete) {
				this.particles.splice(i, 1);
				i--;
			}
		}
	}

	updateTool() {
		if (this.selectedTool) {
			this.selectedTool.update();
		}
	}

	drawTool() {
		if (this.selectedTool) {
			this.selectedTool.draw();
		}
	}

	calcMouse(x, y) {
		return createVector(((x - (width / 2)) / this.zoom) + this.cameraCenter.x, ((y - (height / 2)) / this.zoom) + this.cameraCenter.y);
	}

	toScreenspace(x, y) { // Converts a workspace position back into a screenspace position
		return createVector(((x - this.cameraCenter.x) * this.zoom) + width / 2, ((y - this.cameraCenter.y) * this.zoom) + height / 2);
	}

	get mouse() {
		return this.calcMouse(mouseX, mouseY);
	}

	changeZoom(zoom) { // Zoom code when scrolling
		let center = this.calcMouse(mouseX, mouseY);
		this.scroll += zoom * this.scroll;

		if (this.scroll < 0.2) { // scroll bounds
			this.scroll = 0.2;
		}
		if (this.scroll > 5) {
			this.scroll = 5;
		}
		//this.zoom = Math.round(this.scroll * 20) / 20;
		this.zoom = this.scroll;
		if (abs(this.scroll - 1) <= 0.05) {
			this.zoom = 1;
		}
		let newCenter = this.calcMouse(mouseX, mouseY) // zoom is centered on the mouse
		let diff = p5.Vector.sub(center, newCenter);
		this.cameraCenter.add(diff);
		this.zoomTextTimer = 1;
	}

	doScroll(amt) { } // Unused here, but is used (overriden) by FrontEndWorkspace for part list scrolling.

	addTool(tool) {
		this.tools.push(tool);
		tool.workspace = this;
	}

	selectTool(tool) {
		if (!this.tools.indexOf(tool) == -1) {
			throw new Error("Workspace: attempted to select a tool that was not in the tools list!")
		}
		if (this.selectedTool) {
			this.selectedTool.deactivate();
		}
		tool.activate();
		this.selectedTool = tool;
	}

	deselectTool() {
		if (this.selectedTool) {
			this.selectedTool.deactivate();
			this.selectedTool = null;
		}
	}

	/**
	 * A simple mouse event. This comes from input.js
	 * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
	 * @param {Number} button Button index
	 * @param {MouseEvent} e Mouse Event
	 */
	mouseEvent(p, button, e) {
		if (this.selectedTool && (this.validMousePoint(mouseX, mouseY) || !p)) { // Pass events to our tool
			this.selectedTool.mouseEvent(p, button, e)
		}

		if (p && this.getHoveredButton()) {
			this.shouldClick = this.getHoveredButton(); // Logic for proper mouse interactions (you can't click the button unless you both click and release on the same one)
		}

		if (!p && this.getHoveredButton()) {
			if (this.getHoveredButton() == this.shouldClick) {
				this.shouldClick.callback(); // actually run whatever the button does
			}
		}

		if (!p) {
			this.shouldClick = null; // forget what button we were supposed to click on release
		}
	}

	getHoveredButton() {
		for (let i of this.buttons) {
			if (i.mouseHovered()) {
				return i;
			}
		}
		return null;
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {KeyboardEvent} e 
	 */
	keyEvent(key, e) { // Only used for button keybindings
		for (let i of this.buttons) {
			if (i.key == key) {
				i.flash();
				i.callback();
				break;
			}
		}
	}

	validMousePoint(x, y) { // Whether or not the mouse is in the workspace. This is defined here so that you can't click on something behind the buttons.
		let hoveringButton = false;
		for (let i of this.buttons) {
			if (i.mouseHovered()) {
				hoveringButton = true;
				break;
			}
		}
		return this.mouseArea.pointIntersects(x, y) && !hoveringButton;
	}
}