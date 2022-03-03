class Part {
    constructor(partdata) {
        /**
         * @type {Attachment[]}
         */
        this.attachments = [];
        if (partdata) {
            this.name = partdata.name;
            /**
             * @type {String}
             */
            this.type = partdata.type;
            this.image = partdata.image;
            this.scale = partdata.scale;
            this.basegun = partdata.basegun;

            if (partdata.attachments) {
                this.deserializeAttachments(partdata.attachments);
            }
        }
    }

    deserializeAttachments(list) {
        console.log()
        for (let part of list) {
            this.attachments.push(new Attachment(part.x, part.y, part.type, part.parent, part.rotation, part.scale))
        }
    }

    serialize() {
        let out = {};
        out.name = this.name;
        out.type = this.type;
        out.image = this.image;
        out.scale = this.scale;
        out.basegun = this.basegun;
        out.attachments = [];
        for (let a of this.attachments) {
            out.attachments.push(a.serialize());
        }
        return out;
    }
}