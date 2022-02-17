class Part {
    constructor(partdata) {
        /**
         * @type {Attachment[]}
         */
        this.attachments = [];
        this.name = partdata.name;
        this.type = partdata.type;
        this.image = partdata.image;
        this.scale = partdata.scale;
    }

    serialize() {
        let out = {};
        out.name = this.name;
        out.type = this.type;
        out.image = this.image;
        out.scale = this.scale;
        out.attachments = [];
        for (let a of this.attachments) {
            out.attachments.push(a.serialize());
        }
        return out;
    }
}