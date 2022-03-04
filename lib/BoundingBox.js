
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
    static pointIntersects(box, x = 0, y = 0) {
        let testX = x - box.pos.x;
        let testY = y - box.pos.y;
        let ang = atan2(testY, testX);
        let rad = dist(0, 0, testX, testY);
        ang -= box.rot;
        testX = cos(ang) * rad;
        testY = sin(ang) * rad;
        let halfWidth = box.width/2;
        let halfHeight = box.height/2;
        if (abs(testX) < halfWidth && abs(testY) < halfHeight) {
            return true;
        } else {
            return false;
        }
    }

    static fromCorner(pos, w, h, rot) {
        return new BoundingBox(createVector(pos.x + w/2, pos.y + h/2), w, h, rot);
    }

    setCornerPos(x, y) {
        if (x != null) {
            this.pos.x = x + this.width/2;
        }
        if (y != null) {
            this.pos.y = y + this.height/2;
        }
    }

    get cornerPos() {
        return createVector(pos.x - w/2, pos.y - h/2);
    }

    boxTranslate() {
        translate(this.pos.x, this.pos.y);
        rotate(this.rot);
    }
    
    drawRect() {
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
    pointIntersects(x, y) {
        return BoundingBox.pointIntersects(this, x, y);
    }
}