class Attachment {
    /**
     * 
     * @param {Number} x X position of the attachment point relative to the part
     * @param {Number} y Y position of the attachment point relative to the part
     * @param {String} type Attachment points must share a type to be connected
     * @param {Boolean} parent If this point accepts connections or connects to other parents (think of the difference between the male/female ends of a plug)
     * @param {Number} rotation The direction the attachment faces. To attach rotations must be opposite
     */
    constructor(x, y, type, parent, rotation) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.parent = parent;
        this.rotation = rotation;
    }

    serialize() {
        let out = {};
        out.x = this.x;
        out.y = this.y;
        out.type = this.type;
        out.parent = this.parent;
        out.rotation = this.rotation;
        
        return out;
    }
}