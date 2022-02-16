class Attachment {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    serialize() {
        let out = {};
        out.x = this.x;
        out.y = this.y;
        this.type= type;
        return out;
    }
}