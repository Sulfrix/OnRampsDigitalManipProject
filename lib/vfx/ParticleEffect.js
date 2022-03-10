// These won't do much other than look pretty.
class ParticleEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = "NONE";
        this.shouldDelete = false;
        this.lifetime = 1;
        this.time = 0;
    }

    get pTime() {
        return this.time/this.lifetime
    }

    get rTime() {
        return (this.lifetime-this.time)/this.lifetime;
    }

    draw() {
        throw new Error("ParticleEffect.draw() shouldn't be called. Extend the class!");
    }

    update() {
        this.time += deltaTime/1000;
        if (this.time > this.lifetime) {
            this.shouldDelete = true;
        }
    }


}