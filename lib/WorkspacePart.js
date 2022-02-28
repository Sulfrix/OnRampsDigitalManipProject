// A part in a workspace. This is not a part itself (Parts themselves are supposed to be unchanged)
// It is an instance of a part.


class WorkspacePart {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Part} part
     */
    constructor(x, y, part) {
        this.x = x;
        this.y = y;
        this.rot = 0;
        this.part = part;

        /**
         * @type {Workspace}
         */
        this.workspace = null;

        this.attachments = [];

        this.image = loadImage(this.part.image);
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

    registerAttachments() { // instance part attachments
        for (let attach of this.part.attachments) {
            let newPoint = Object.assign(new Attachment(), attach);
            newPoint.part = this;
            this.attachments.push(newPoint);
        }
    }

    serialize() {
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

    getRelPos(x, y) {
        let tempX = x - this.x;
        let tempY = y - this.y;
        tempX /= this.width /2;
        tempY /= this.height/2;
        tempX = map(tempX, -1, 1, -1, 1, true);
        tempY = map(tempY, -1, 1, -1, 1, true);
        return createVector(tempX, tempY);
    }
}


// For use in the Part Editor, gives us a specific "expanded" value which will be
// used for UI.
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