//This file is where the meat of the app's UI will be placed.

class FrontEndWorkspace extends Workspace {
    constructor() {
        super();
        this.sidebarWidth = 350;
        this.sidebarCols = 4;
        this.tabs = [];
        this.currTab = null;
        for (let catname in categories) {
            let cat = categories[catname]
            let newTab = new Tab(catname, cat, this);
            this.tabs.push(newTab);
        }
    }

    get mouseArea() {
        if (!this.cacheMouseArea) {
            this.cacheMouseArea = new BoundingBox(createVector((width / 2) + this.sidebarWidth / 2, height / 2), (width) - this.sidebarWidth, height, 0)
        }
        return this.cacheMouseArea;
    }

    draw() {
        super.draw()
        push();
        noStroke();
        fill(0, 127);
        rect(0, 0, this.sidebarWidth, height);
        pop();
        let row = 0;
        let col = 0;
        for (let x of this.tabs) {
            let posX = col * (this.sidebarWidth / this.sidebarCols);
            let posY = row * 30;
            let boxwidth = this.sidebarWidth / this.sidebarCols;
            let boxheight = 30;

            noStroke();
            noFill();
            if (mouseX >= posX && mouseX <= posX + boxwidth) {
                if (mouseY >= posY && mouseY < posY + boxheight) {
                    fill(255, 20);
                    if (pInput.leftDown()) {
                        fill(255, 50);
                        this.currTab = x;
                    }
                }
            }
            rect(posX, posY, boxwidth, boxheight)
            let g = tabRender(x, boxwidth, boxheight);
            image(g, posX, posY);
            if (this.currTab == x) {
                fill(99, 235, 221);
                rect(posX, posY + (boxheight - 2), boxwidth, 2);
            }

            col++
            if (col >= this.sidebarCols) {
                col = 0;
                row++
            }
        }
    }
}

let textCache = {};

function tabRender(tab, w, h) {
    let index = (tab.name) + ", " + (tab.workspace.currTab == tab ? "hovered" : "normal");
    if (textCache[index]) {
        return textCache[index];
    } else {
        let g = createGraphics(w, h);
        g.background(255, 0, 255);
        g.noStroke();
        g.fill(255);
        if (tab.workspace.currTab == tab) {
            g.fill(99, 235, 221)
        }
        g.textAlign(CENTER, CENTER);
        g.textSize(15);
        g.text(tab.name, 0, w / 2, w);
        textCache[index] = g;
        return g;
    }
}

class Tab {
    constructor(name, parts, workspace) {
        this.name = prettyPrintCategoryName(name);
        this.parts = parts;
        this.workspace = workspace;
    }
};