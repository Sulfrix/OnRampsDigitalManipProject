// While the Workspace is a generic area for parts to be placed and manipulated, this class provides the real UX for our app.

/**
 * @type {import("types").Graphics}
 */
let plg;

class FrontEndWorkspace extends Workspace {
    constructor() {
        super();
        this.sidebarWidth = 400;
        this.sidebarCols = 4; // Columns of tabs
        this.tabs = [];
        this.currTab = null;
        for (let catname in categories) { // Register the currently loaded categories into tabs
            let cat = categories[catname]
            let newTab = new Tab(catname, cat, this);
            this.tabs.push(newTab);
        }

        this.partListBox = null; // A BoundingBox used to detect if the mouse is over the part list

        this.partListScroll = 0; // Scroll offset of the part list
        this.partListMax = 0; // Bottom of the part list
        this.partListScrollbar = 1; // Animation timer to show the scrollbar

        this.partListAnimTop = 0; // Animation timer for the Android-style "wave" effect when hitting the top or the bottom
        this.partListAnimBottom = 0;
    }

    get mouseArea() { // The mouse area is smaller so we don't grab parts that are behind another UI element (the sidebar)
        if (!this.cacheMouseArea) {
            this.cacheMouseArea = new BoundingBox(createVector((width / 2) + this.sidebarWidth / 2, height / 2), (width) - this.sidebarWidth, height, 0)
        }
        return this.cacheMouseArea;
    }

    draw() {
        super.draw()
        push();
        noStroke();
        fill(0, 127); // Sidebar background
        rect(0, 0, this.sidebarWidth, height);
        pop();
        let tabHeight = this.drawTabs(); // Draw the tabs
        this.drawPartsList(0, tabHeight+10, this.sidebarWidth, height - tabHeight-10); // Draw the part list
        { // Each of the animation timers needs to be updated and clamped, these braces are here so it can be collapsed in a code editor
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
        this.drawCursorPart(); // Drawn here as well so it goes over the sidebar
        if (this.cursorPart && this.validMousePoint(mouseX, mouseY)) {
            this.placeOnCursor(true); // Places the part if it is dragged into the workspace
        }
    }

    drawPartsList(x, y, w, h) {
        this.partListBox = BoundingBox.fromCorner(createVector(x, y), w, h); // Set the part list bounding box
        if (this.currTab) {
            let t = this.currTab;
            if (!plg) { // the part list is drawn in an off-screen canvas so it doesn't overflow
                plg = createGraphics(w, h);
            } else {
                if (plg.height != h || plg.width != w) {
                    plg.resizeCanvas(w, h);
                }
            }
            plg.clear(); // Instead of a solid background we want a transparent background
            plg.reset(); // This is automatically called on the base canvas but not Graphics buffers
            plg.push();
            plg.translate(0, -this.partListScroll) // scroll
            let yCur = 0; // A 'cursor' that is moved down as we draw more parts
            for (let i of t.parts) { // A bunch of code that defines and draws the layout of all of the parts
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
            if (this.partListMax > 0) { // Draw an Android-style "wave" effect when we hit the top or bottom of the scrollable area
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

            
            image(plg, x, y); // Actually draw the buffer to the normal canvas
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

    drawTabs() { // Lots of layout code so these tabs draw left-to-right, top-to-bottom.
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
                if (mouseY > posY && mouseY < posY + boxheight) { // This is where mouse clicks on the tabs are detected
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
            let g = tabRender(x, boxwidth, boxheight); // The actual text is also drawn in offscreen buffers so it is cropped when the name is too long
            image(g, posX, posY);
            if (this.currTab == x) { // Draw an underline on tabs when selected
                fill(99, 235, 221);
                rect(posX, posY + (boxheight - 2), boxwidth, 2);
            }

            col++
            if (col >= this.sidebarCols) { // Like word wrap but for these tabs
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
     mouseEvent(p, button, e) { // What detects when you have selected a part on the sidebar and puts it on your cursor
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

let textCache = {}; // We cache the images of the text as regenerating these every frame is very performance heavy

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

class Tab { // Contains info on a tab 
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

class PartListing { // What the part list is drawing
    static drawHeight = 100; // static variables to keep track of how tall each part listing should be and 
    static textHeight = 15;  // how much space the text should take up

    constructor(partPath) {
        this.partPath = partPath; // URL path to the part, as loading every file as soon as the sketch is neither needed nor performant
        /**
         * @type {Part}
         */
        this.part = null; // The actual part this refers to
        this.initialized = false; // These variables keep track of the part's state. It might have been more wise to have a single "state" variable
        this.isLoading = false;
        this.imageReady = false;
        this.imageLoading = false;
        this.imageError = false;
        this.image = null; // The image to draw, also kept seperate and not loaded on sketch load to keep bandwidth costs down when first loading sketch
        this.lastY = 0;
        this.boundingBox = BoundingBox.fromCorner(createVector(0, 0), 0, PartListing.drawHeight, 0); // Used to detect overing and clicks
        this.tabheight = 60; // A local variable that keeps track of how much the tabs push the part list down
        this.pos = createVector(0, 0);
    }

    /**
     * 
     * @param {import("types").Graphics} g the graphics buffer we'll draw to
     * @param {Number} w width of the parts list
     */
    draw(g, w) {
        let h = PartListing.drawHeight;
        g.push();
        g.fill(255);
        if (this.isHovered()) { // highlight if hovered
            g.push();
            g.fill(255, 40);
            g.noStroke();
            g.rect(0, 0, w, h);
            g.pop();
            
            g.fill(99, 235, 221)
            
        }
        g.noStroke();
        if (!this.initialized) { // Don't load parts until we are visible
            g.textAlign(CENTER, CENTER);
            g.text("Loading...", w / 2, h / 2);
            if (!this.isLoading) { // Only load once
                this.isLoading = true;
                loadJSON(this.partPath, {}, "json", (data) => {
                    this.initialized = true;
                    this.isLoading = false;
                    this.part = new Part(data);
                }, () => {
                    console.log("Failed loading " + this.partPath);
                });
            }
        } else {
            if (!this.imageReady) {
                if (this.imageError) {
                    g.push();
                    g.textAlign(CENTER, CENTER);
                    g.textSize(20);
                    g.text("Error", w / 2, (h - PartListing.textHeight) / 2); // Draw error text if the image couldn't be found
                    g.pop();
                } else {
                    g.push();
                    g.textAlign(CENTER, CENTER);
                    g.text("Loading...", w / 2, (h - PartListing.textHeight) / 2);
                    g.pop();
                    if (!this.imageLoading) { // Dont load image until the part .json file is loaded
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
                g.image(this.image, w / 2 - size.w / 2, size.offsetY+1, size.w, size.h); // Draw the image
                g.pop();
            }
            push();
            g.textAlign(CENTER, TOP);
            g.textSize(PartListing.textHeight) // Logic for processing the name ofthe part, in most cases we are already in a tab of the same type of part so we usually only draw the gun name to distinguish
            let str = this.part.basegun;
            if (this.part.name.toLowerCase() != this.part.type.toLowerCase()) {
                str = this.part.basegun + " - " + this.part.name;
            }
            if (!this.part.basegun || this.part.basegun == "" || this.part.basegun.toLowerCase() == this.part.name.toLowerCase()) {
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
        return new WorkspacePart(0, 0, this.part, this.image);
    }
}
