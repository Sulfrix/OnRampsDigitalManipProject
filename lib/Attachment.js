class Attachment {
    /**
     * 
     * @param {Number} x X position of the attachment point relative to the part
     * @param {Number} y Y position of the attachment point relative to the part
     * @param {String} type Attachment points must share a type to be connected
     * @param {Boolean} parent If this point accepts connections or connects to other parents (think of the difference between the male/female ends of a plug)
     */
    constructor(x, y, type, parent) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.parent = parent;
    }

    serialize() {
        let out = {};
        out.x = this.x;
        out.y = this.y;
        this.type= type;
        return out;
    }
}