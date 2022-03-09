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

        this.partListScroll = 0;
        this.partListMax = 0;
        this.partListScrollbar = 1;

        this.partListAnimTop = 0;
        this.partListAnimBottom = 0;
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
        {
            if (this.partListScrollbar > 0) {
                this.partListScrollbar -= deltaTime/1000;
            }
            if (this.partListScrollbar < 0) {
                this.partListScrollbar = 0;
            }
    
            if (this.partListAnimTop > 0) {
                this.partListAnimTop -= deltaTime/500;
            }
            if (this.partListAnimTop < 0) {
                this.partListAnimTop = 0;
            }
    
            if (this.partListAnimBottom > 0) {
                this.partListAnimBottom -= deltaTime/500;
            }
            if (this.partListAnimBottom < 0) {
                this.partListAnimBottom = 0;
            }
        }
        this.drawCursorPart();
        if (this.cursorPart && this.validMousePoint(mouseX, mouseY)) {
            this.placeOnCursor(true);
        }
    }

    drawPartsList(x, y, w, h) {
        this.partListBox = BoundingBox.fromCorner(createVector(x, y), w, h);
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
            plg.reset();
            plg.push();
            plg.translate(0, -this.partListScroll)
            let yCur = 0;
            for (let i of t.parts) {
                plg.push();
                plg.translate(0, yCur);
                i.tabheight = y;
                i.boundingBox.width = this.sidebarWidth;
                i.boundingBox.setCornerPos(0+x, yCur-this.partListScroll+y);
                i.pos = createVector(x, yCur-this.partListScroll+y);
                let render = i.draw(plg, this.sidebarWidth);
                i.lastY = yCur;
                yCur += render+6;
                plg.pop();
            }
            plg.pop();
            this.partListMax = yCur - h;
            if (this.partListMax < 0) {
                this.partListMax = 0;
            }
            if (this.partListMax > 0) {
                plg.push();
                plg.noStroke();

                plg.push();
                let scrollbarWidth = 10;
                plg.fill(255, 50*this.partListScrollbar);
                plg.rect(w-scrollbarWidth, 0, scrollbarWidth, h);
                let thumbHeight = ((h/(this.partListMax+h))*h);
                plg.fill(255, 120*this.partListScrollbar);
                plg.rect(w-scrollbarWidth, (this.partListScroll/this.partListMax)*(h-thumbHeight), scrollbarWidth, thumbHeight);
                plg.pop();

                plg.push();
                plg.fill(99, 235, 221, 30*this.partListAnimTop);
                plg.ellipse((w-scrollbarWidth)/2, 0, w-scrollbarWidth, 50*this.partListAnimTop)
                plg.pop();

                plg.push();
                plg.fill(99, 235, 221, 30*this.partListAnimBottom);
                plg.ellipse((w-scrollbarWidth)/2, h, w-scrollbarWidth, 50*this.partListAnimBottom)
                plg.pop();

                plg.pop();
            }

            
            image(plg, x, y);
        }

        
    }

    doScroll(amt) {
        this.partListScrollbar = 1;
        if (this.partListBox.pointIntersects(mouseX, mouseY)) {
            this.partListScroll += amt;
        }
        if (this.partListScroll < 0) {
            this.partListScroll = 0;
            this.partListAnimTop = 1;
        }
        if (this.partListScroll > this.partListMax) {
            this.partListScroll = this.partListMax;
            this.partListAnimBottom = 1;
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
                        this.partListScroll = 0;
                        this.partListScrollbar = 1;
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

    /**
     * A simple mouse event.
     * @param {Boolean} p If true, the mouse was pressed down. If false, the mouse was released.
     * @param {Number} button Button index
     * @param {MouseEvent} e Mouse Event
     */
     mouseEvent(p, button, e) {
        super.mouseEvent(p, button, e);
        if (p && this.currTab) {
            for (let i of this.currTab.parts) {
                if (i.isHovered()) {
                    this.grabOnCursor(i.instantiatePart());
                    let fit = rectFitEx(this.sidebarWidth-10, PartListing.drawHeight-PartListing.textHeight-1, i.image.width, i.image.height);
                    this.cursorPartPos = createVector(i.pos.x+fit.offsetX+5, i.pos.y+fit.offsetY+1);
                    this.cursorPartSize = createVector(fit.w, fit.h);
                }
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
        this.lastY = 0;
        this.boundingBox = BoundingBox.fromCorner(createVector(0, 0), 0, PartListing.drawHeight, 0);
        this.tabheight = 60;
        this.pos = createVector(0, 0);
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
        if (this.isHovered()) {
            g.push();
            g.fill(255, 40);
            g.noStroke();
            g.rect(0, 0, w, h);
            g.pop();
            
            g.fill(99, 235, 221)
            
        }
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
                g.push();
                let imageHeight = h - PartListing.textHeight;
                //let imageRatio = imageHeight / this.image.height;
                //let imageWidth = this.image.width * imageRatio;
                let size = rectFitEx(w-10, imageHeight-1, this.image.width, this.image.height);
                g.image(this.image, w / 2 - size.w / 2, size.offsetY+1, size.w, size.h);
                g.pop();
            }
            push();
            g.textAlign(CENTER, TOP);
            g.textSize(PartListing.textHeight)
            let str = this.part.basegun;
            if (this.part.name.toLowerCase() != this.part.type.toLowerCase()) {
                str = this.part.basegun + " - " + this.part.name;
            }
            if (!this.part.basegun || this.part.basegun.toLowerCase() == this.part.name.toLowerCase()) {
                str = this.part.name;
            }
            g.text(str, w / 2, h - PartListing.textHeight);
            pop();
        }
        g.pop();
        return h;
    }

    isHovered(tabheight = this.tabheight) {
        if (this.boundingBox.pointIntersects(mouseX, mouseY) && mouseY > tabheight) {
            return true;
        }
        return false;
    }

    instantiatePart() {
        return new WorkspacePart(0, 0, this.part, this.image)
    }
}
