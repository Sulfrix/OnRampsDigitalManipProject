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
    snapToPart(otherPart = null){
        // Not supporting inserted otherParts for now
        // TODO: make code dependent on the parent property in attachment points
        //       i.e. if you drag a barrel with an attachment on it, the attachment
        //       will move with the barrel. I'd recommend keeping track of whether
        //       or not attachment points are connected in the class 
        //       (Attachment.connectedTo) and having an updatePos() method on parts
        //       Our attachments system should be heavily "directional," where the
        //       receiver goes to the barrel and the stock, and then the barrel
        //       could go to a sight. To put it in a different way, the barrel
        //       attaches to the receiver, the receiver DOES NOT attach to the barrel.
        let finalA1 = null;
        let finalI = null;
        let finalA2 = null;
        let minDist;

        for(let a1 in this.attachments){
            minDist = this.attachments[a1].elipson;
            for(let i in this.workspace.parts){

                let otherPart = this.workspace.parts[i];
                for(let a2 in this.workspace.parts[i].attachments){
                    
                    let dist = Math.hypot(
                        (this.x + this.attachments[a1].x * this.width/2) -
                        (otherPart.x + otherPart.attachments[a2].x * otherPart.width/2),
                        (this.y + this.attachments[a1].y * this.height/2) -
                        (otherPart.y + otherPart.attachments[a2].y * otherPart.height/2));

                    if(dist < minDist && this.attachments[a1].canFit(otherPart.attachments[a2])){
                        finalA1 = this.attachments[a1];
                        finalI = otherPart;
                        finalA2 = otherPart.attachments[a2];
                    }
                }
            }
        }

        if(finalA1 && finalI && finalA2){
            this.x = finalI.x + finalI.width/2 * (finalA2.x) - this.width/2 * (finalA1.x);
            this.y = finalI.y + finalI.height/2 * (finalA2.y) - this.height/2 * (finalA1.y);
        }
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