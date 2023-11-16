class PerfTrack {

    /**
     * @type {PerfTrack}
     */
    static current = null
    static enabled = true

    // I feel like it's faster to turn these functions into no-ops when disabling tracking
    // instead of checking for some `enabled` variable every time
    static enableTracking() {
        PerfTrack.push = (name) => {return PerfTrack._push(name)}
        PerfTrack.pop = () => {return PerfTrack._pop()}
        this.enabled = true
    }

    static disableTracking() {
        PerfTrack.push = (name) => {} // nop
        PerfTrack.pop = () => {} // nop
        this.enabled = false
    }

    /**
     * "Push" a new track onto the stack. Call at the beginning of code to be measured.
     * @param {*} name 
     * @returns void
     */
    static push(name) {return PerfTrack._push(name)}

    /**
     * "Pop" the current track off of the stack. Call at the end of the code to be measured.
     * @returns {PerfTrack} Info regarding this section's timings
     */
    static pop() {return PerfTrack._pop()}

    /**
     * Syntatic sugar to avoid calling `push()` and `pop` and rather just measures a lambda function.
     * @param {function():void} lambda Function to run. Returns performance info.
     */
    static measure(name, lambda) {
        this.push(name)
        lambda()
        return this.pop()
    }

    static _push(name) {
        var track = new PerfTrack(name)
        if (PerfTrack.current) {
            track.parent = PerfTrack.current
            PerfTrack.current.subTracks.push(track)
        }
        PerfTrack.current = track
    }

    static _pop() {
        if (PerfTrack.current) {
            var cur = PerfTrack.current
            cur.endTime = performance.now()
            cur.finished = true
            if (cur.parent) {
                PerfTrack.current = cur.parent
            } else {
                PerfTrack.current = null
            }
            return cur
        }
    }

    constructor(name) {
        this.name = name
        this.startTime = performance.now()
        this.endTime = Infinity
        this.finished = false
        /**
         * @type {PerfTrack[]}
         */
        this.subTracks = []
        /**
         * @type {PerfTrack}
         */
        this.parent = null
    }

    cleanParent() {
        if (this.parent) {
            delete this.parent
        }
        if (this.finished) {
            delete this.finished
        }
        if (this.subTracks.length == 0) {
            delete this.subTracks
        } else {
            this.subTracks.forEach((track) => {track.cleanParent()})
        }
    }

    preCalcLength() {
        this.calcLength = this.getLength()
        if (this.subTracks) {
            this.subTracks.forEach((track) => {track.preCalcLength()})
        }
    }

    serialize() {
        this.cleanParent()
        this.preCalcLength()
        return JSON.stringify(this)
    }

    getLength() {
        if (this.finished) {
            return this.endTime - this.startTime
        } else {
            return performance.now() - this.startTime
        }
    }

    get lengthGetter() { // for easy evaluation in devtools
        return this.getLength()
    }

    display(x, y, w, level = 0) {
        let end = this.endTime
        if (level == 0) {
            push()
            colorMode(HSB)
            noStroke()
            textAlign(LEFT, TOP)
            end = this.startTime+perfGraph.targetFrameTimeMs
        }
        fill(level*10, 100, 100)
        rect(x, y, w, 10)
        fill(level*10, 50, 100)
        text(this.name, x, y)
        for (let i in this.subTracks) {
            let subTrack = this.subTracks[i]
            let subStart = map(subTrack.startTime, this.startTime, end, x, x+w)
            let subEnd = map(subTrack.endTime, this.startTime, end, x, x+w)
            let subWidth = subEnd-subStart
            subTrack.display(subStart, y-10-i*10, subWidth, level+1)
        }
        if (level == 0) {
            pop()
        }
    }
}

PerfTrack.disableTracking()