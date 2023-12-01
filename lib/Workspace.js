const gridGap = 30;

/**
 * @typedef {Object} SaveData
 * @property {SerializedPNode[]} nodes
 * @property {SerializedTrace[]} traces
 * @property {Object} cameraInfo
 * @property {Object} cameraInfo.pos
 * @property {number} cameraInfo.pos.x
 * @property {number} cameraInfo.pos.y
 * @property {number} cameraInfo.zoom
 */

/**
 * Workspace where nodes are viewed and manipulated.
 * Workspaces will likely contain one function/part of a program, using multiple workspaces to represent multiple functions/files.
 */
class Workspace {
	constructor() {
		/**
		 * Nodes currently on the workspace.
		 * @type {Array<PNode>}
		 */
		this.nodes = [];
		/**
		 * Nodes selected to be manipulated by the user.
		 * @type {PNode[]}
		 */
		this.selectedNodes = [];
		/**
		 * Center of the workspace camera.
		 */
		this.cameraCenter = createVector(0, 0);
		this.zoom = 1;
		/**
		 * Internal value for scroll, use `Workspace.zoom` for the actual zoom value.
		 */
		this.scroll = 1;
		/**
		 * If true, renders a faster but uglier line grid instead of a dot grid.
		 */
		this.lineGrid = true;
		/**
		 * Visible portion of the workspace, used for culling.
		 * @type {BoundingBox}
		 */
		this.screenArea = new BoundingBox(createVector(0, 0), width, height);

		this.mousePos = createVector();
		this.pMousePos = createVector(); // The position of the mouse the previous frame, useful for getting motion

		this.zoomTextTimer = 0;

		this.cacheMouseArea = null; // Hold the mouseArea value every frame so it is not calculated more than once per frame (more than the values can change)

		/**
		 * @type {Trace[]}
		 */
		this.traces = []

		/**
		 * @deprecated
		 * @type {OverlayButton[]}
		 */
		this.buttons = [];

		/**
		 * @deprecated
		 */
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
		this.populateButtons();
	}

	/**
	 * Saves the current state of the workspace to an Object.
	 * @returns {SaveData} Object that should be serialized.
	 */
	saveState() {
		return {
			nodes: this.nodes.map((node) => {return node.serialize()}),
			traces: this.traces.map((trace) => {return trace.serialize()}),
			cameraInfo: {
				pos: {x: this.cameraCenter.x, y: this.cameraCenter.y},
				zoom: this.zoom
			}
		}
	}

	/**
	 * Loads state from an object that was likely parsed from a JSON file.
	 * @param {SaveData} data 
	 */
	loadState(data) {
		this.nodes = []
		this.traces = []
		data.nodes.forEach((spnode) => {this.addNode(PNode.createFromData(spnode))})
		data.traces.forEach((strace) => {this.addTrace(Trace.createFromData(strace, this))})
		this.cameraCenter = createVector(data.cameraInfo.pos.x, data.cameraInfo.pos.y)
		this.scroll = data.cameraInfo.zoom
		this.zoom = this.scroll
	}

	/**
	 * Creates a new workspace using save data.
	 * @param {SaveData} data 
	 * @returns {Workspace}
	 */
	static newWorkspaceFromSave(data) {
		let wp = Workspace.newFromTemplate()
		wp.loadState(data)
		return wp
	}

	/**
	 * Finds a node by UUID. *Currently iterates through all nodes.*
	 * @param {string} uuid
	 * @returns {PNode} The first node found with the supplied UUID.
	 */
	findNodeByUUID(uuid) {
		// TODO: use a map for this instead of searching all nodes
		for (let node of this.nodes) {
			if (node.uuid == uuid) {
				return node
			}
		} 
	}

	/**
	 * Adds a trace to the workspace and sets its `trace.workspace` value.
	 * @param {Trace} trace 
	 */
	addTrace(trace) {
		this.traces.push(trace)
		trace.workspace = this
	}

	/**
	 * Removes a trace from the workspace.
	 * * **DOES NOT REMOVE REFERENCES TO TRACE! USE `Trace.remove()`!**
	 * @param {Trace} trace 
	 */
	removeTrace(trace) {
		let ind = this.traces.indexOf(trace)
		if (ind != -1) {
			this.traces.splice(ind, 1)
		}
	}

	/**
	 * Creates a new workspace with the standard set of tools. Preferred to using the base constructor.
	 * @returns {Workspace}
	 */
	static newFromTemplate() {
		let workspace = new Workspace();
		workspace.addTool(new SelectionTool());
		workspace.addTool(new MoveTool());
		workspace.addTool(new RotateTool());
		workspace.addTool(new ScaleTool());
		workspace.addTool(new TraceEditTool());
		workspace.selectTool(workspace.tools[0]);
		return workspace;
	}

	/**
	 * @deprecated
	 * Adds a base set of `OverlayButton`s for testing.
	 * Will be removed in the future.
	 */
	populateButtons() {
		this.buttons.push(
			new OverlayButton(
				"✋",
				"Move Nodes",
				() => {
					let i = this.tools.findIndex((v) => {
						return v instanceof MoveTool;
					});
					if (i == -1) {
						console.log("Error: can't find move tool");
						return;
					}
					this.selectTool(this.tools[i]);
				},
				50,
				"g"
			)
		);
		this.buttons.push(
			new OverlayButton(
				"🔃",
				"Rotate Nodes",
				() => {
					let i = this.tools.findIndex((v) => {
						return v instanceof RotateTool;
					});
					if (i == -1) {
						console.log("Error: can't find rotate tool");
						return;
					}
					this.selectTool(this.tools[i]);
				},
				50,
				"r"
			)
		);
		this.buttons.push(
			new OverlayButton(
				"📏",
				"Scale Nodes",
				() => {
					let i = this.tools.findIndex((v) => {
						return v instanceof ScaleTool;
					});
					if (i == -1) {
						console.log("Error: can't find scale tool");
						return;
					}
					this.selectTool(this.tools[i]);
				},
				50,
				"s"
			)
		);
		this.buttons.push(
			new OverlayButton(
				"A",
				"Select All",
				() => {
					this.selectedNodes = this.nodes;
				},
				50,
				"a"
			)
		);
		this.buttons.push(
			new OverlayButton(
				"📈",
				"Toggle Perf Info",
				() => {
					if (PerfTrack.enabled) {
						PerfTrack.disableTracking();
					} else {
						PerfTrack.enableTracking();
					}
				},
				50,
				"p"
			)
		);
		this.buttons.push(
			new OverlayButton("L", "Load File", async () => {
				let files = await showOpenFilePicker()
				this.loadState(JSON.parse(await (await files[0].getFile()).text()))
			})
		)
		this.buttons.push(
			new OverlayButton("S", "Save File", async () => {
				save(this.saveState(), "workspaceSave.json")
			})
		)
	}

	set selectedNodes(value) {
		if (this.selectedTool && this.selectedTool.lockSelection) {
			console.log(
				"TODO: node selection attempted to change while using tool with locked selection"
			);
			return;
		}
		this._selectedNodes = value;
	}

	/**
	 * @returns {PNode[]}
	 */
	get selectedNodes() {
		return this._selectedNodes;
	}

	/**
	 * Adds a node to the workspace and sets its `PNode.workspace` value.
	 * @param {PNode} node 
	 */
	addNode(node) {
		node.workspace = this;
		this.nodes.push(node);
	}

	/**
	 * The area of the workspace that counts as "onscreen."
	 * @returns {BoundingBox}
	 */
	get mouseArea() {
		if (!this.cacheMouseArea) {
			this.cacheMouseArea = new BoundingBox(
				createVector(width / 2, height / 2),
				width,
				height,
				0
			);
		}
		return this.cacheMouseArea;
	}

	/**
	 * `Workspace.mouseArea` is cached by default to prevent creating new BoundingBox objects every frame.
	 * This function needs to be called whenever `mouseArea` needs to change.
	 */
	invalidateMouseArea() {
		this.cacheMouseArea = null;
	}

	draw() {
		PerfTrack.push("Workspace Draw");

		this.screenArea.pos = this.cameraCenter;
		this.screenArea.width = width / this.zoom;
		this.screenArea.height = height / this.zoom;
		push();
		this.doCameraTransform(); // Transform to "workspace" coordinates
		PerfTrack.measure("Draw Grid", this.drawGrid.bind(this));

		PerfTrack.measure("Draw Traces", () => {this.drawTraces()})

		
		PerfTrack.push("Draw Nodes");
		for (let node of this.nodes) {
			if (BoundingBox.boxesIntersect(this.screenArea, node.boundingBox)) {
				node.draw();
			}
		}
		PerfTrack.pop();

		this.drawParticles();
		this.drawTool();
		pop();
		{
			PerfTrack.push("Zoom Text");
			// This draws the current zoom level in the top left of the screen (2x, 1x, 3.55x, etc.)
			push();
			textSize(60);
			textAlign(LEFT, TOP);
			fill(255, map(this.zoomTextTimer, 0, 1, 0, 200, true));
			text(
				Math.round(this.zoom * 20) / 20 + "x",
				this.mouseArea.pos.x - this.mouseArea.width / 2 + 10,
				10
			);
			if (this.zoomTextTimer > 0) {
				let time = deltaTime / 1000;
				this.zoomTextTimer -= time;
			} else {
				this.zoomTextTimer = 0;
			}
			pop();
			PerfTrack.pop();
		}

		PerfTrack.push("Draw Buttons");
		this.drawButtons(); // Draw the circular buttons in the bottom left corner.
		PerfTrack.pop();

		PerfTrack.pop();
	}
	
	drawTraces() {
		for (let trace of this.traces) {
			trace.draw()
		}
	}

	/**
	 * @deprecated
	 * Draws overlay buttons
	 */
	drawButtons() {
		if (this.buttons.length > 0) {
			let mA = this.mouseArea;
			let edgePadding = 15;
			let buttonPadding = 7;
			push();
			let cornerX = mA.pos.x - mA.width / 2 + edgePadding;
			let cornerY = mA.pos.y + mA.height / 2 - edgePadding;
			let offsetY = cornerY;
			for (let i of this.buttons) {
				i.pos.x = cornerX - i.rad * 1.5 * (1 - i.slide);
				i.pos.y = offsetY;
				let size = i.draw();
				offsetY -= size + buttonPadding * i.slide;
			}
			pop();
		}
	}

	drawParticles() {
		for (let p of this.particles) {
			p.draw();
		}
	}

	/**
	 * Transforms all p5 drawing commands to appear in the workspace, with the correct camera position and zoom.
	 */
	doCameraTransform() {
		PerfTrack.measure("Camera Transform", () => {
			translate(Math.ceil(width / 2.0), Math.floor(height / 2.0));
			if (this.zoom != 1) {
				scale(this.zoom);
			}
			if (this.screenArea.rot != 0) {
				rotate(-this.screenArea.rot);
			}
			translate(p5.Vector.mult(this.cameraCenter, -1));
		});
	}

	drawGrid() {
		let gridGapUse = gridGap; //space between grid points, re-referenced here because in development I wanted to have dynamic grid sizes
		if (this.lineGrid) {
			if (this.zoom <= 0.5) {
				gridGapUse *= 2;
			}
		}
		let gridStartX =
			floor(
				(this.cameraCenter.x - floor(width / this.zoom / 2)) /
					gridGapUse
			) * gridGapUse;
		let gridStartY =
			floor(
				(this.cameraCenter.y - floor(height / this.zoom / 2)) /
					gridGapUse
			) * gridGapUse;
		let gridHeight =
			ceil((height + gridGapUse * this.zoom) / gridGapUse / this.zoom) +
			1;
		let gridWidth =
			ceil((width + gridGapUse * this.zoom) / gridGapUse / this.zoom) + 1;
		push();
		if (!this.lineGrid) {
			let gridCount = gridHeight * gridWidth;
			noStroke();
			fill(0, 60);
			// if there are too many dots, disable render
			if (gridCount < 3000) {
				for (let y = 0; y < gridHeight; y++) {
					for (let x = 0; x < gridWidth; x++) {
						let posX = x * gridGapUse + gridStartX;
						let posY = y * gridGapUse + gridStartY;
						circle(posX, posY, 3);
						//point(posX, posY)
					}
				}
			}
		} else {
			stroke(40);
			//strokeWeight(1/this.zoom);
			strokeWeight(2);
			noSmooth();
			strokeCap(SQUARE);
			for (let y = 0; y < gridHeight; y++) {
				let x = 0;
				let posX = Math.round(x * gridGapUse + gridStartX);
				let posY = Math.round(y * gridGapUse + gridStartY);
				line(posX, posY, posX + width / this.zoom + gridGapUse, posY);
			}
			for (let x = 0; x < gridWidth; x++) {
				let y = 0;
				let posX = Math.round(x * gridGapUse + gridStartX);
				let posY = Math.round(y * gridGapUse + gridStartY);
				line(posX, posY, posX, posY + height / this.zoom + gridGapUse);
			}
		}
		pop();
	}

	update() {
		PerfTrack.push("Workspace Update");
		this.mousePos = this.calcMouse(mouseX, mouseY); // converts the screenspace mouse position into a workspace mouse position
		if (
			(pInput.rightDown() || pInput.middleDown()) &&
			this.validMousePoint(mouseX, mouseY)
		) {
			// drag the screen
			let mousePos = createVector(mouseX, mouseY);
			let pMousePos = createVector(pmouseX, pmouseY);
			let diff = p5.Vector.sub(pMousePos, mousePos);
			diff.div(this.zoom);
			if (this.screenArea.rot != 0) {
				diff.rotate(this.screenArea.rot);
			}
			this.cameraCenter.add(diff);
		}
		PerfTrack.push("Tool Update");
		this.updateTool(); // updates tool, very important for the Hand tool
		PerfTrack.pop();

		this.updateParticles();
		this.pMousePos = this.mousePos.copy();

		// TODO: Don't do this in update
		if (this.selectedTool instanceof SelectionTool) {
			this.buttons.forEach((v) => {
				v.targetSlide = 1;
			});
		} else {
			this.buttons.forEach((v) => {
				v.targetSlide = 0;
			});
		}
		PerfTrack.pop();
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

	/**
	 * Transforms screenspace coordinates into workspace coordinates.
	 * * Should probably be renamed.
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {Vector}
	 */
	calcMouse(x, y) {
		if (this.screenArea.rot != 0) {
			var pos = createVector(
				(x - width / 2) / this.zoom,
				(y - height / 2) / this.zoom
			);
			pos.rotate(this.screenArea.rot);
			return pos.add(this.cameraCenter);
		}
		return createVector(
			(x - width / 2) / this.zoom + this.cameraCenter.x,
			(y - height / 2) / this.zoom + this.cameraCenter.y
		);
	}

	/**
	 * Converts a workspace position back into a screenspace position.
	 * * Doesn't account for screen rotation yet.
	 * @param {number} x 
	 * @param {number} y 
	 * @returns 
	 */
	toScreenspace(x, y) {
		return createVector(
			(x - this.cameraCenter.x) * this.zoom + width / 2,
			(y - this.cameraCenter.y) * this.zoom + height / 2
		);
	}

	/**
	 * Current mouse position in workspace coordinates.
	 * * Calls `Workspace.calcMouse()`
	 */
	get mouse() {
		return this.calcMouse(mouseX, mouseY);
	}

	/**
	 * Changes the current zoom value, centered on the mouse position.
	 * @param {number} zoom Difference in zoom.
	 */
	changeZoom(zoom) {
		// Zoom code when scrolling
		let center = this.calcMouse(mouseX, mouseY);
		this.scroll += zoom * this.scroll;

		if (this.scroll < 0.2) {
			// scroll bounds
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
		let newCenter = this.calcMouse(mouseX, mouseY); // zoom is centered on the mouse
		let diff = p5.Vector.sub(center, newCenter);
		this.cameraCenter.add(diff);
		this.zoomTextTimer = 1;
	}

	/**
	 * Adds a tool to the workspace and sets its `tool.workspace` value.
	 * @param {Tool} tool 
	 */
	addTool(tool) {
		this.tools.push(tool);
		tool.workspace = this;
	}

	/**
	 * Sets the currently active tool, ensuring that the previous tool is deactivated properly.
	 * @param {Tool} tool 
	 */
	selectTool(tool) {
		if (!this.tools.indexOf(tool) == -1) {
			throw new Error(
				"Workspace: attempted to select a tool that was not in the tools list!"
			);
		}
		if (this.selectedTool) {
			this.selectedTool.deactivate();
		}
		tool.activate();
		this.selectedTool = tool;
	}

	/**
	 * Clears the currently active tool, properly deactivating the previous one.
	 */
	deselectTool() {
		if (this.selectedTool) {
			this.selectedTool.deactivate();
			this.selectedTool = null;
		}
	}

	/**
	 * A simple mouse event. This is called from input.js
	 * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
	 * @param {Number} button Button index
	 * @param {MouseEvent} e Mouse Event
	 */
	mouseEvent(p, button, e) {
		if (this.selectedTool && (this.validMousePoint(mouseX, mouseY) || !p)) {
			// Pass events to our tool
			this.selectedTool.mouseEvent(p, button, e);
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

	/**
	 * Extra event handler for mouse motion.
	 * @param {MouseEvent} e
	 */
	mouseMove(e) {
		if (this.selectedTool && this.validMousePoint(mouseX, mouseY)) {
			// Pass events to our tool
			this.selectedTool.mouseMove(e);
		}
	}

	/**
	 * @deprecated
	 * @returns {OverlayButton | null} Currently hovered overlay button. Returns null if no button is hovered.
	 */
	getHoveredButton() {
		for (let i of this.buttons) {
			if (i.mouseHovered()) {
				return i;
			}
		}
		return null;
	}

	/**
	 * Called when a key is pressed. Currently only used for overlay button keybindings.
	 * @param {string} key
	 * @param {KeyboardEvent} e
	 */
	keyEvent(key, e) {
		for (let i of this.buttons) {
			if (i.key == key) {
				i.flash();
				i.callback();
				break;
			}
		}
	}

	/**
	 * Determines valid mouse position.
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {boolean} Whether or not the mouse is in the workspace.
	 */
	validMousePoint(x, y) {
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
