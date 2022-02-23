
class BoundingBox {
    /**
     * 
     * @param {p5.Vector} pos 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} rot 
     */
    constructor(pos, width, height, rot) {
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

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    pointIntersects(x, y) {
        BoundingBox.pointIntersects(this, x, y);
    }
}