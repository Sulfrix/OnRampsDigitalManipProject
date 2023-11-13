/// <reference path="../types/p5/global.d.ts"/>

class PNode {
	constructor() {
		this.name = "Node";
		this.boundingBox = new BoundingBox(createVector(), 150, 150);
		this.padding = 9;
		this.innerDetail = 5;
		this.gbuffer = createGraphics(150, 150);
		this.maskbuffer = createGraphics(150, 150);
		this.updateSize();
		this.forceClip = false;

		/**
		 * @type {Workspace}
		 */
		this.workspace = null;

		/**
		 * @type {Socket[]}
		 */
		this.inputSockets = [];
		/**
		 * @type {Socket[]}
		 */
		this.outputSockets = [];

		this.shouldRepaint = false;

		// TODO: Prototype code, please remove
		this.addSocket(new Socket("A", this, "number", "i"));
		this.addSocket(new Socket("B", this, "number", "i"));
		this.addSocket(new Socket("Out", this, "number", "o"));
	}

	/**
	 *
	 * @param {Socket} socket
	 */
	addSocket(socket) {
		switch (socket.io) {
			case "i":
				this.inputSockets.push(socket);
				break;
			case "o":
				this.outputSockets.push(socket);
				break;
		}
		this.shouldRepaint = true;
	}

	get pos() {
		return this.boundingBox.pos;
	}

	get width() {
		return this.boundingBox.width;
	}

	get height() {
		return this.boundingBox.height;
	}

	updateSize() {
		this.gbuffer.resizeCanvas(
			this.width * this.innerDetail,
			this.height * this.innerDetail
		);
		//this.gbuffer.elt.willReadFrequenty = true
		this.maskbuffer.resizeCanvas(
			this.width * this.innerDetail,
			this.height * this.innerDetail
		);
		if (!this.forceClip) {
			this.drawMask(this.maskbuffer);
		}
		this.repaint();
	}

	drawMask(g) {
		//g.clear()
		g.reset();
		g.scale(this.innerDetail);
		g.noStroke();
		g.fill(255);
		let maskpadding = 2.5;
		//g.rect(1, 1, this.width-2, this.height-2, (this.padding*2)-1)
		g.rect(
			maskpadding,
			maskpadding,
			this.width - maskpadding * 2,
			this.height - maskpadding * 2,
			this.padding * 1.5 - maskpadding
		);
	}

	update() {}

	/**
	 * 0 - use Image.mask() (slow)
	 * 1 - use clip() in drawinner() (faster)
	 */
	static maskMethod = 1;

	repaint() {
		this.drawInner(this.gbuffer);
		if (!this.forceClip && PNode.maskMethod == 1) {
			this.masked = this.gbuffer.get();
			this.masked.mask(this.maskbuffer);
		} else {
			this.masked = this.gbuffer;
		}
	}

	draw() {
		if (this.shouldRepaint) {
			this.repaint();
			this.shouldRepaint = false;
		}
		push();

		this.boundingBox.boxTranslate();
		translate(-this.width / 2, -this.height / 2);
		//stroke(0)
		//strokeWeight(2)
		//noFill()
		fill(0);
		if (this.workspace.selectedNodes.indexOf(this) != -1) {
			fill(255);
		}
		noStroke(0);
		rect(0, 0, this.width, this.height, this.padding * 1.5);

		noSmooth();
		let bufimg = this.masked;
		if (this.workspace.zoom > 1.5 || this.forceClip) {
			clip(() => {
				let maskpadding = 2.5;
				rect(
					maskpadding,
					maskpadding,
					this.width - maskpadding * 2,
					this.height - maskpadding * 2,
					this.padding * 1.5 - maskpadding
				);
			});
			bufimg = this.gbuffer;
		}
		scale(1 / this.innerDetail);
		image(bufimg, 0, 0);

		pop();
		this.drawSocketPoints();
	}

	static socketDraw(node, socket) {
		let drawPos = node.boundingBox.localPosCorner(socket.pos);
		//ellipse(drawPos.x, drawPos.y, 10, 10, 8)
		rect(drawPos.x - 5, drawPos.y - 5, 10, 10);
	}

	drawSocketPoints() {
		if (this.workspace.zoom < 0.25) {
			return;
		}
		push();
		fill(255);
		stroke(0);
		strokeWeight(1);
		const lambda = (socket) => {
			return PNode.socketDraw(this, socket);
		};
		this.inputSockets.forEach(lambda);
		this.outputSockets.forEach(lambda);
		pop();
	}

	/**
	 *
	 * @param {import("types/p5").Graphics} g
	 */
	drawInner(g) {
		g.clear();
		g.reset();
		g.scale(this.innerDetail);
		if (!this.forceClip && PNode.maskMethod == 0) {
			g.clip(() => {
				this.drawMask(g);
			});
		}
		g.background(80);
		this.drawTitle(g);
		this.drawSocketText(g);
	}

	/**
	 *
	 * @param {import("types/p5").Graphics} g
	 */
	drawTitle(g) {
		g.push();
		g.textSize(14);
		g.noStroke();
		g.textAlign(LEFT, TOP);
		g.fill(80, 0, 0);
		g.rect(0, 0, this.width, g.textSize() + this.padding);
		g.fill(255);
		g.text(this.name, this.padding, this.padding);
		g.pop();
	}

	/**
	 *
	 * @param {import("types/p5").Graphics} g
	 */
	drawSocketText(g) {
		g.push();
		g.textSize(13);
		g.textAlign(LEFT, CENTER);
		g.fill(255);
		let socketBaseline = 14 + this.padding * 2.5;
		for (let i in this.inputSockets) {
			let ypos = socketBaseline + 23 * i;
			let socket = this.inputSockets[i];
			g.text(socket.name, this.padding + 6, ypos);
			socket.pos = createVector(0, ypos);
		}
		g.textAlign(RIGHT, CENTER);
		for (let i in this.outputSockets) {
			let ypos = socketBaseline + 23 * i;
			let socket = this.outputSockets[i];
			g.text(socket.name, this.width - this.padding - 6, ypos);
			socket.pos = createVector(this.width, ypos);
		}
		g.pop();
	}
}
