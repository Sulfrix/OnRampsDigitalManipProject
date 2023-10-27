// The defintion of a part in program memory.
// Contains the part name, image URL, attachments

class Part {
    constructor(partdata) { // partdata refers to the .json files
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
                this.deserializeAttachments(partdata.attachments); // Instance the objects in the .json file as Attachment objects
            }
        }
    }

    deserializeAttachments(list) {
        for (let part of list) {
            let newPoint = new Attachment(part.x, part.y, part.type, part.parent, part.rotation, part.scale);
            if (part.reject) {
                newPoint.reject = part.reject;
            }
            this.attachments.push(newPoint);

        }
    }

    serialize() { // Get the json file for this part
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