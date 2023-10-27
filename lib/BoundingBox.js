// A simple representation of a box that is mostly used for "is the mouse touching this object?"
// Can be used in workspace coordinates or screenspace coordinates
class BoundingBox {
    /**
     * 
     * @param {p5.Vector} pos 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} rot 
     */
    constructor(pos, width, height, rot = 0) {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.rot = rot;
    }

    /**
     * 
     * @param {BoundingBox} box 
     * @param {Number} x 
     * @param {Number} y 
     */
    static pointIntersects(box, x = 0, y = 0) { // Is this point touching the box?
        let testX = x - box.pos.x;
        let testY = y - box.pos.y;
        if (box.rot != 0) {
            // Only calculate rotations if the bb is rotated
            // this turns out to be 99.9999% of the bounding boxes in the project, oh well :P
            let ang = atan2(testY, testX); // calculate angle
            let rad = dist(0, 0, testX, testY);
            ang -= box.rot; // counter rotate by box rotation
            testX = cos(ang) * rad;
            testY = sin(ang) * rad;
        }
        let halfWidth = box.width/2;
        let halfHeight = box.height/2;
        if (abs(testX) < halfWidth && abs(testY) < halfHeight) { // test bounds
            return true;
        } else {
            return false;
        }
    }

    static fromCorner(pos, w, h, rot) {
        return new BoundingBox(createVector(pos.x + w/2, pos.y + h/2), w, h, rot); // The position of a bounding box is its center. This method quickly creates one using the corner as the position
    }

    setCornerPos(x, y) { // Sets position based on corner position
        if (x != null) {
            this.pos.x = x + this.width/2;
        }
        if (y != null) {
            this.pos.y = y + this.height/2;
        }
    }

    get cornerPos() { // returns corner position
        return createVector(pos.x - w/2, pos.y - h/2);
    }

    boxTranslate() { // Translates the view into coordinates relative to the bounding box
        translate(this.pos.x, this.pos.y);
        rotate(this.rot);
    }
    
    drawRect() { // Mostly unused (except for part selection in the part editor) draws a rectangle representing the bounding box. Good debugging tool.
        push();
        this.boxTranslate();
        rect(this.width/-2, this.height/-2, this.width, this.height);
        pop();
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    pointIntersects(x, y) { // Point intersection with bounding boxes is static, so for convenience it can be called here.
        return BoundingBox.pointIntersects(this, x, y);
    }
}