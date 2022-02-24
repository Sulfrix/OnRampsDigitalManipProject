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

        this.image = loadImage(this.part.image);
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
            for(let a of this.part.attachments){
                a.draw(this);
            }
        }
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