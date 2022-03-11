// A part in a workspace. This is not a part itself (Parts themselves are supposed to be unchanged)
// It is an instance of a part.


class WorkspacePart {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Part} part
     */
    constructor(x, y, part, image) {
        this.x = x;
        this.y = y;
        this.rot = 0; // unused, parts were planned to rotate in respone to being placed on angled attachment points, but was cut
        this.part = part;

        /**
         * @type {Workspace}
         */
        this.workspace = null;

        /**
         * @type {Attachment[]}
         */
        this.attachments = [];

        if (!image) { // Either allow a p5 Image object to be passed or just use the part definition image URL;
            this.image = loadImage(this.part.image);
        } else {
            this.image = image;
        }
        this.registerAttachments();
    }

    draw(drawAttachments = false) {
        push();
        translate(this.x, this.y);
        rotate(this.rot);
        scale(this.part.scale);
        image(this.image, -this.image.width/2, -this.image.height/2);
        pop();
        
        // loop through points
        if(drawAttachments){
            for(let a of this.attachments){
                a.draw(this);
            }
        }
    }
    
    update() {
        this.updatePosition();
    }

    registerAttachments() { // instance part attachments from the file
        for (let attach of this.part.attachments) {
            let newPoint = Object.assign(new Attachment(), attach);
            newPoint.part = this;
            this.attachments.push(newPoint);
        }
    }

    serialize() { // used in part editor when we were making parts to actually turn our work into a file that can be loaded
        let part = Object.assign(new Part(), this.part);
        part.attachments = this.attachments;
        return part.serialize();
    }

    get width() {
        return this.image.width*this.part.scale;
    }

    get height() {
        return this.image.height*this.part.scale;
    }

    get boundingBox() {
        return new BoundingBox(createVector(this.x, this.y), this.width, this.height, this.rot);
    }

    getRelPos(x, y) { // Attachment points are not the position in pixels but rather a fraction of the part's width from -1 to 1
        let tempX = x - this.x;
        let tempY = y - this.y;
        tempX /= this.width /2;
        tempY /= this.height/2;
        tempX = map(tempX, -1, 1, -1, 1, true);
        tempY = map(tempY, -1, 1, -1, 1, true);
        return createVector(tempX, tempY);
    }

    detachFromParent() {
        for (let i of this.attachments) {
            if (!i.parent && i.otherPoint) {
                i.detach();
            }
        }
    }

    detachAll() {
        for (let i of this.attachments) {
            i.detach();
        }
    }

    updatePosition() { // Position next to the part we are attached to
        for (let i of this.attachments) {
            if (!i.parent && i.otherPoint) {
                let o = i.otherPoint;
                let p = i.otherPoint.part;
                this.x = p.x + p.width/2 * o.x - this.width/2 * i.x;
                this.y = p.y + p.height/2 * o.y - this.height/2 * i.y;
            }
            else if (i.parent && i.otherPoint && i.otherPoint.part != this){
                let p = i.otherPoint.part;
            }
        }
    }

    findChildren(recurse = false){ // returns list of our children. Parts are their own children.
        console.trace("findChildren()");
        let children = [this];
        for(let a in this.attachments){
            if(this.attachments[a].otherPoint && this.attachments[a].parent){
                if (recurse) {
                    let newChildren = this.attachments[a].otherPoint.part.findChildren();
                    for (let i in newChildren){
                        children.push(newChildren[i]);
                    }
                } else {
                    children.push(this.attachments[a].otherPoint.part);
                }
                
            }
        }

        return children;
    }

    hasParent() {
        for (let a of this.attachments) {
            if (a.otherPoint && !a.parent) {
                return true;
            }
        }
        return false;
    }

    snapToPart(otherPart) { // ran when releasing a part to check for something to attach to
        let attachTo;
        let attachFrom;
        let a;

        let doLoop = true;

        for (let i = 0; i < this.attachments.length && doLoop; i++) {
            a = this.attachments[i]
            if (!a.parent) {
                let nearby = a.findNearbyPoints(true); // returns list of all valid fitting points within distance
                if (nearby.length > 0) {
                    if (nearby[0].part == otherPart || !otherPart) {
                        attachTo = nearby[0]; // maybe pick closest one?
                        attachFrom = a;
                        doLoop = false;
                    }
                }
            }
        }

        if (attachTo && attachFrom) {
            attachFrom.snapTo(attachTo);
        }
    }

}


// For use in the Part Editor, gives us a specific "expanded" value which will be
// used for UI.

// That comment was written when we started the project and looking back I'm surprised this is all this was used for
class EditorPart extends WorkspacePart {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Part} part
     */
    constructor(x, y, part) {
        super(x, y, part);
        this.inspectorExpanded = false;
    }
}