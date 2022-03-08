class OverlayButton {
    /**
     * A button that is overlaid in the bottom left corner
     * @param {String} char A single character to represent the icon of the button.
     * @param {Function} callback The function this button should call when clicked.
     */
    constructor(char, callback, rad = 50, key) {
        this.char = char;
        this.callback = callback;
        this.rad = rad;
        this.key = key;
        this.pos = createVector();
    }

    draw() {
        push();
        fill(0, 127);
        circle(this.pos.x+this.rad/2, this.pos.y+this.rad/2, this.rad);
        pop();
        return this.rad;
    }
}