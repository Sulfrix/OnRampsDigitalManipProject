class OverlayButton {
    /**
     * A button that is overlaid in the bottom left corner
     * @param {String} char A single character to represent the icon of the button.
     * @param {Function} callback The function this button should call when clicked.
     */
    constructor(char, name, callback, rad = 50, key) {
        this.char = char;
        this.name = name;
        this.callback = callback;
        this.rad = rad;
        this.key = key;
        this.pos = createVector();
        this.hoverTimer = 0;
    }

    draw() {
        push();
        let centerPosX = this.pos.x+this.rad/2;
        let centerPosY = this.pos.y-this.rad/2;
        fill(0, 127);
        if (this.mouseHovered()) {
            fill(120, 127)
            if (mouseIsPressed) {
                fill(140, 128);
            }
            this.hoverTimer -= (this.hoverTimer-1)/5;
        } else {
            this.hoverTimer -= (this.hoverTimer-0)/5;
        }
        noStroke();
        circle(centerPosX, centerPosY, this.rad);
        textSize(this.rad/2);
        textAlign(CENTER, CENTER);
        fill(255)
        if (this.mouseHovered()) {
            fill(99, 235, 221)
        }
        text(this.char, centerPosX, centerPosY);
        textAlign(LEFT, CENTER);
        fill(255, 255*this.hoverTimer)
        stroke(0, 255*this.hoverTimer);
        strokeWeight(this.rad/40);
        if (!this.key) {
            text(this.name, centerPosX+this.rad/2+5+(5*this.hoverTimer), centerPosY);
        } else {
            text(this.name, centerPosX+this.rad/2+5+(5*this.hoverTimer), centerPosY-textSize()/4);
            textSize(textSize()/2)
            fill(255, 255*this.hoverTimer);
            noStroke();
            text(`(key: '${this.key}')`, centerPosX+this.rad/2+5+(5*this.hoverTimer), centerPosY+textSize()*1.1);
        }
        pop();
        return this.rad;
    }

    mouseHovered() {
        return this.intersects(mouseX, mouseY);
    }

    intersects(x, y) {
        let sz = this.getSize()/2
        return dist(this.pos.x+sz, this.pos.y-sz, x, y) < sz;
    }

    getSize() {
        return this.rad;
    }
}