/// <reference path="../types/p5/global.d.ts"/>

class PNode {
    constructor() {
        this.name = "Node"
        this.boundingBox = new BoundingBox(createVector(), 150, 150)
        this.padding = 9
        this.innerDetail = 5
        this.gbuffer = createGraphics(150, 150)
        this.maskbuffer = createGraphics(150, 150)
        this.updateSize()

        /**
         * @type {Workspace}
         */
        this.workspace = null
    }

    get pos() {
        return this.boundingBox.pos
    }
    
    get width() {
        return this.boundingBox.width
    }

    get height() {
        return this.boundingBox.height
    }

    updateSize() {
        this.gbuffer.resizeCanvas(this.width*this.innerDetail, this.height*this.innerDetail)
        //this.gbuffer.elt.willReadFrequenty = true
        this.maskbuffer.resizeCanvas(this.width*this.innerDetail, this.height*this.innerDetail)
        //this.drawMask()
        this.repaint()
    }

    drawMask() {
        let g = this.maskbuffer
        g.clear()
        g.reset()
        g.scale(this.innerDetail)
        g.rect(1, 1, this.width-2, this.height-2, (this.padding*2)-1)
    }

    update() {}

    repaint() {
        this.drawInner(this.gbuffer)
        this.masked = this.gbuffer.get()
        //this.masked.mask(this.maskbuffer)
    }

    draw() {
        push()

        this.boundingBox.boxTranslate()
        translate(-this.width/2, -this.height/2)
        //stroke(0)
        //strokeWeight(2)
        //noFill()
        fill(0)
        if (this.workspace.selectedNodes.indexOf(this) != -1 || this.boundingBox.pointIntersects(this.workspace.mousePos.x, this.workspace.mousePos.y)) {
            fill(255)
        }
        noStroke(0)
        rect(0, 0, this.width, this.height, this.padding*1.5)
        
        push()
        noSmooth()
        clip(() => {
            let maskpadding = 2.5
            rect(maskpadding, maskpadding, this.width-maskpadding*2, this.height-maskpadding*2, (this.padding*1.5)-maskpadding)
        })
        scale(1/this.innerDetail)
        image(this.masked, 0, 0)
        pop()

        pop()
    }

    /**
     * 
     * @param {import("types/p5").Graphics} g 
     */
    drawInner(g) {
        g.clear()
        g.reset()
        g.background(80)
        g.scale(this.innerDetail)
        this.drawTitle(g)
    }

    /**
     * 
     * @param {import("types/p5").Graphics} g 
     */
    drawTitle(g) {
        g.push()
        g.textSize(14)
        g.noStroke()
        g.textAlign(LEFT, TOP)
        g.fill(80, 0, 0)
        g.rect(0, 0, this.width, g.textSize()+this.padding)
        g.fill(255)
        g.text(this.name, this.padding, this.padding)
        g.pop()
    }
}