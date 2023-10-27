class AttachEffect extends ParticleEffect {
    constructor(x, y) {
        super(x, y);
        this.type = "AttachEffect";
        this.lifetime = 0.25;
    }

    draw() {
        push();
        translate(this.x, this.y);
        strokeWeight(5);
        noFill();
        stroke(255, 255*this.rTime);
        circle(0, 0, 35+30*this.pTime);
        pop();
    }
}