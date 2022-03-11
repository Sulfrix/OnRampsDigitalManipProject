// The points where parts can attach.

// The position of an attachment point is not the amount in units it is offset from the center but rather a fraction based on part size.
// i.e. for the X coord -1 is the left edge, 1 is the right edge, 0 is center

class Attachment {
    /**
     * 
     * @param {Number} x X position of the attachment point relative to the part's position and scale
     * @param {Number} y Y position of the attachment point relative to the part's position and scale
     * @param {String} type Attachment points must share a type to be connected
     * @param {Boolean} parent A parent attachment must connect to a child, and vice versa
     * @param {Number} rotation The direction the attachment faces. Unused.
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
        this.elipson = 120; // The "radius" of the attachment points that is needed to attach
        this.reject = []; // a list of part names this will refuse to fit with
        
        // not serialized
        /**
         * @type {Attachment}
         */
        this.otherPoint = null; // The point this is attached to
        /**
         * @type {WorkspacePart}
         */
        this.part = null; // The part this is associated with
        
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

    draw(part){ // Attachment points are only drawn in the part editor
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

    canFit(otherPoint) { // Determines valid attachments
        if(this.type == otherPoint.type) { // must be same type
            if (this.parent != otherPoint.parent) { // A parent attachment must connect to a child, and vice versa
                let otherName = this.part.part.name;
                if (!otherPoint.reject.includes(otherName)) { // Reject if specified
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {Attachment} otherPoint 
     */
    snapTo(otherPoint){ // Attach points
        if (!otherPoint.otherPoint) {
            this.otherPoint = otherPoint;
            otherPoint.otherPoint = this;
            playSound("attach");
            this.part.workspace.particles.push(new AttachEffect(otherPoint.getPos().x, otherPoint.getPos().y))
        }
    }

    getPos() { // Gets the actual position of the attachment point based on the part
        let out = createVector();
        out.x = this.part.x+(this.x * this.part.width/2);
        out.y = this.part.y+(this.y * this.part.height/2);
        return out;
    }

    getRelPos(x, y) { // Converts a point in the workspace to a point relative to the part
        return this.part.getRelPos(x, y);
    }

    setRelPos(x, y) { // Sets the position based on a workspace position
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

    findNearbyPoints(caresAboutFit = true) { // Finds a valid nearby point (for attaching)
        let out = [];
        for (let p of this.part.workspace.parts) {
            if (p != this.part) {
                for (let a of p.attachments) {
                    if ((this.canFit(a) | !caresAboutFit) && !a.otherPoint) {
                        let aPos = a.getPos();
                        let thisPos = this.getPos();
                        if (thisPos.dist(aPos) < (this.elipson+a.elipson)/2) {
                            out.push(a);
                        }
                    }
                }
            }
        }
        return out;
    }
}