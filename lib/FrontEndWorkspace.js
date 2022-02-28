//This file is where the meat of the app's UI will be placed.

/**
 * @type {import("types").Graphics}
 */
let plg;

class FrontEndWorkspace extends Workspace {
    constructor() {
        super();
        this.sidebarWidth = 400;
        this.sidebarCols = 4;
        this.tabs = [];
        this.currTab = null;
        for (let catname in categories) {
            let cat = categories[catname]
            let newTab = new Tab(catname, cat, this);
            this.tabs.push(newTab);
        }

        this.partListBox = null;
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
        let tabHeight = this.drawTabs();
        this.drawPartsList(0, tabHeight+10, this.sidebarWidth, height - tabHeight-10);
    }

    drawPartsList(x, y, w, h) {
        this.partListBox = BoundingBox.fromCorner(x, y, w, h);
        if (this.currTab) {
            let t = this.currTab;
            if (!plg) {
                plg = createGraphics(w, h);
            } else {
                if (plg.height != h || plg.width != w) {
                    plg.resizeCanvas(w, h);
                }
            }
            plg.clear();
            let yCur = 0;
            for (let i of t.parts) {
                plg.push();
                plg.translate(0, yCur);
                let render = i.draw(plg, this.sidebarWidth);
                yCur += render+6;
                plg.pop();
            }
            image(plg, x, y);
        }
    }

    drawTabs() {
        let row = 0;
        let col = 0;
        push();
        for (let x of this.tabs) {
            let posX = col * (this.sidebarWidth / this.sidebarCols);
            let posY = row * 30;
            let boxwidth = this.sidebarWidth / this.sidebarCols;
            let boxheight = 30;

            noStroke();
            noFill();
            if (mouseX > posX && mouseX < posX + boxwidth) {
                if (mouseY > posY && mouseY < posY + boxheight) {
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
        pop();
        return (row + 1) * 30;
    }
}

let textCache = {};

function tabRender(tab, w, h) {
    let index = (tab.name) + ", " + (tab.workspace.currTab == tab ? "hovered" : "normal");
    if (textCache[index]) {
        return textCache[index];
    } else {
        let g = createGraphics(w, h);
        g.noLoop();
        //g.background(255, 0, 255);
        g.noStroke();
        g.fill(255);
        if (tab.workspace.currTab == tab) {
            g.fill(99, 235, 221)
        }
        g.textAlign(CENTER, CENTER);
        g.textSize(15);
        g.text(tab.name, w / 2, h / 2);
        textCache[index] = g;
        return g;
    }
}

class Tab {
    constructor(name, parts, workspace) {
        this.name = prettyPrintCategoryName(name);
        /**
         * @type {PartListing[]}
         */
        this.parts = [];
        this.workspace = workspace;

        for (let path of parts) {
            let newListing = new PartListing(path);
            this.parts.push(newListing);
        }
    }
};

class PartListing {
    static drawHeight = 100;
    static textHeight = 15;

    constructor(partPath) {
        this.partPath = partPath;
        /**
         * @type {Part}
         */
        this.part = null;
        this.initialized = false;
        this.isLoading = false;
        this.imageReady = false;
        this.imageLoading = false;
        this.imageError = false;
        this.image = null;
    }

    /**
     * 
     * @param {import("types").Graphics} g 
     * @param {Number} w 
     */
    draw(g, w) {
        let h = PartListing.drawHeight;
        g.push();
        g.fill(255);
        g.noStroke();
        if (!this.initialized) {
            g.textAlign(CENTER, CENTER);
            g.text("Loading...", w / 2, h / 2);
            if (!this.isLoading) {
                this.isLoading = true;
                loadJSON(this.partPath, {}, "json", (data) => {
                    this.initialized = true;
                    this.isLoading = false;
                    this.part = data;
                });
            }
        } else {
            if (!this.imageReady) {
                if (this.imageError) {
                    g.push();
                    g.textAlign(CENTER, CENTER);
                    g.textSize(20);
                    g.text("Error", w / 2, (h - PartListing.textHeight) / 2);
                    g.pop();
                } else {
                    g.push();
                    g.textAlign(CENTER, CENTER);
                    g.text("Loading...", w / 2, (h - PartListing.textHeight) / 2);
                    g.pop();
                    if (!this.imageLoading) {
                        this.imageLoading = true;
                        loadImage(this.part.image, (data) => {
                            this.image = data;
                            this.imageLoading = false;
                            this.imageReady = true;
                        }, () => {
                            this.imageReady = false;
                            this.imageError = true;
                        });
                    }
                }

            } else {
                let imageHeight = h - PartListing.textHeight;
                //let imageRatio = imageHeight / this.image.height;
                //let imageWidth = this.image.width * imageRatio;
                let size = rectSize(w-10, imageHeight-10, this.image.width, this.image.height);
                g.image(this.image, w / 2 - size.w / 2, 0, size.w, size.h);
            }
            push();
            g.textAlign(CENTER, TOP);
            g.textSize(PartListing.textHeight)
            g.text(this.part.name, w / 2, h - PartListing.textHeight);
            pop();
        }
        g.pop();
        return h;
    }
}
