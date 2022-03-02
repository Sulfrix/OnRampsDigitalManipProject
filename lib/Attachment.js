class Attachment {
    /**
     * 
     * @param {Number} x X position of the attachment point relative to the part
     * @param {Number} y Y position of the attachment point relative to the part
     * @param {String} type Attachment points must share a type to be connected
     * @param {Boolean} parent A parent attachment must connect to a child, and vice versa
     * @param {Number} rotation The direction the attachment faces. To attach rotations must be opposite
     * @param {Number} scale Attachments must be the same length, they cam resize if necessary
     */
    constructor(x, y, type, parent, rotation = 0, scale = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.parent = parent;
        this.rotation = rotation;
        this.length = length;
        this.scale = scale;
        this.elipson = 25;
        
        // not serialized
        /**
         * @type {Attachment}
         */
        this.otherPoint = null;
        /**
         * @type {WorkspacePart}
         */
        this.part = null;
        
    }

    serialize() {
        let out = {};
        out.x = this.x;
        out.y = this.y;
        out.type = this.type;
        out.parent = this.parent;
        out.rotation = this.rotation;
        out.scale = this.scale;
        out.elipson = this.elipson;
        
        return out;
    }

    draw(part){
        push();
        translate(part.x, part.y);
        translate(this.x * part.width/2, this.y * part.height/2);
        if (this.parent) {
            strokeWeight(5);
            noFill();
            stroke(255, 255, 255, 100);
            circle(0, 0, 35);
        } else {
            noStroke();
            fill(255, 255, 255, 100);
            circle(0, 0, 30);
        }
        pop();
    }

    canFit(otherPoint) {
        if(this.type == otherPoint.type) {
            if (this.parent != otherPoint.parent) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {Attachment} otherPoint 
     */
    snapTo(otherPoint){
        if (!otherPoint.otherPoint) {
            this.otherPoint = otherPoint;
            otherPoint.otherPoint = this;
            this.part.workspace.particles.push(new AttachEffect(otherPoint.getPos().x, otherPoint.getPos().y))
        }
    }

    getPos() {
        let out = createVector();
        out.x = this.part.x+(this.x * this.part.width/2);
        out.y = this.part.y+(this.y * this.part.height/2);
        return out;
    }

    getRelPos(x, y) {
        return this.part.getRelPos(x, y);
    }

    setRelPos(x, y) {
        let vec = this.getRelPos(x, y);
        this.x = vec.x;
        this.y = vec.y;
    }
    
    detach() {
        if (this.otherPoint) {
            this.otherPoint.otherPoint = null;
            this.otherPoint = null;
        }
    }
}