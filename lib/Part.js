class Part {
    constructor(partdata) {
        /**
         * @type {Attachment[]}
         */
        this.attachments = [];
        this.name = partdata.name;
        this.type = partdata.type;
        this.image = partdata.image;
    }

    serialize() {
        let out = {};
        out.name = this.name;
        out.type = this.type;
        out.image = this.image;
        out.attachments = [];
        for (let a of this.attachments) {
            out.attachments.push(a.serialize());
        }
        return out;
    }
}