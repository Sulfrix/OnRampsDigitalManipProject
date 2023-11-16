class PerfGraph {

	constructor() {
		this.frameTimes = [];
        this.avgFrameTime = 0
        this.timeBufferCap = 30
        this.frameVisLength = 4
        this.targetFrameTimeMs = 16
        this.pixelsPerMs = 10
	}

	recordTime(frameTime) {
		this.frameTimes.push(frameTime);
		while (this.frameTimes.length > this.timeBufferCap) {
			this.frameTimes.shift();
		}
		var sum = 0;
		for (let t of this.frameTimes) {
			sum += t;
		}
		this.avgFrameTime = sum / this.frameTimes.length;
	}

    drawGraph(drawText = true) {
        push();
        if (drawText) {
            fill(255);
            text(Math.round(this.avgFrameTime * 100) / 100 + "ms", 10, 20);
        }
        noStroke();
        fill(255, 128);
        let s = this.frameVisLength;
        for (let i = 0; i < this.frameTimes.length; i++) {
            var t = this.frameTimes[i];
            rect(i * s, 0, s, t * this.pixelsPerMs);
        }
        noFill();
        stroke(255);
        line(0, this.avgFrameTime * this.pixelsPerMs, this.frameTimes.length * s, this.avgFrameTime * this.pixelsPerMs);
        stroke(255, 0, 0);
        line(0, this.targetFrameTimeMs * this.pixelsPerMs, this.frameTimes.length * s, this.targetFrameTimeMs * this.pixelsPerMs);
        pop();
    }
}
