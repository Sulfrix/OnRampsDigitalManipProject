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
    }

    serialize() {
        let out = {};
        out.x = this.x;
        out.y = this.y;
        out.type = this.type;
        out.parent = this.parent;
        out.rotation = this.rotation;
        out.scale = this.scale;
        
        return out;
    }

    draw(part){
        push();
            translate(part.x, part.y);
            translate(this.x * part.width/2, this.y * part.height/2);
            circle(0, 0, 10);
        pop();
    }
}