// TODO: Remove this class

/**
 * @deprecated
 */
class OverlayButton {
	/**
	 * A button that is overlaid in the bottom left corner
	 * @param {String} char A single character to represent the icon of the button.
	 * @param {Function} callback The function this button should call when clicked.
	 */
	constructor(char, name, callback, rad = 50, key) {
		this.char = char; // actually the "label" of the button. usually just a unicode symbol
		this.name = name; // Name that is shown when hovering
		this.callback = callback; // Function to run when the button is clicked
		this.rad = rad; // Radius of the button
		this.key = key; // Keyboard shortcut key
		this.pos = createVector(); // position that is set in draw() to have easy reference to it when detecting intersections
		this.hoverTimer = 0; // Animation timer for the text that slides out of a button
		this.flashTimer = 0; // Buttons flash when the keybind is pressed
		this.slide = 0;
		this.targetSlide = 0;
	}

	draw() {
		this.slide = lerp(
			this.slide,
			this.targetSlide,
			1 - Math.exp((-10 * deltaTime) / 1000)
		);
		if (this.slide <= 0) {
			return 0;
		}
		push();
		//translate((-this.rad*1.5)*(1-this.slide), 0)
		let centerPosX = this.pos.x + this.rad / 2;
		let centerPosY = this.pos.y - this.rad / 2;
		fill(0, 127);
		if (this.mouseHovered()) {
			// highlight effects
			fill(120, 127);
			if (mouseIsPressed) {
				fill(140, 128);
			}
			this.hoverTimer -= (this.hoverTimer - 1) / 5; // start animation
			this.flashTimer = 0; // the button can't flash and be hovered at the same time
		} else {
			if (this.flashTimer == 0) {
				this.hoverTimer -= (this.hoverTimer - 0) / 5;
			}
		}
		noStroke();
		circle(centerPosX, centerPosY, this.rad);
		textSize(this.rad / 2);
		textAlign(CENTER, CENTER);
		fill(255);
		if (this.mouseHovered()) {
			fill(99, 235, 221);
		}
		text(this.char, centerPosX, centerPosY);
		push();
		textAlign(LEFT, CENTER);
		fill(255, 255 * this.hoverTimer);
		stroke(0, 255 * this.hoverTimer);
		strokeWeight(this.rad / 40);
		if (!this.key) {
			// The text draws in a different position if there is no keybind, unusued
			text(
				this.name,
				centerPosX + this.rad / 2 + 5 + 5 * this.hoverTimer,
				centerPosY
			);
		} else {
			text(
				this.name,
				centerPosX + this.rad / 2 + 5 + 5 * this.hoverTimer,
				centerPosY - textSize() / 4
			);
			textSize(textSize() / 2);
			fill(255, 255 * this.hoverTimer);
			noStroke();
			text(
				`(key: '${this.key}')`,
				centerPosX + this.rad / 2 + 5 + 5 * this.hoverTimer,
				centerPosY + textSize() * 1.1
			);
		}
		pop();
		fill(255, 127 * this.flashTimer); // flash button when keybind pressed
		circle(centerPosX, centerPosY, this.rad);
		if (this.flashTimer > 0) {
			this.flashTimer -= deltaTime / 1000;
		}
		if (this.flashTimer < 0) {
			this.flashTimer = 0;
		}
		pop();
		return this.rad * this.slide;
	}

	flash() {
		this.flashTimer = 1;
		this.hoverTimer = 1;
	}

	mouseHovered() {
		return this.intersects(mouseX, mouseY);
	}

	intersects(x, y) {
		let sz = this.getSize() / 2;
		return dist(this.pos.x + sz, this.pos.y - sz, x, y) < sz;
	}

	getSize() {
		return this.rad;
	}
}
