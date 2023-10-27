/// <reference path="types/p5/global.d.ts"/>


let canvas

let clicker = 0;
let clickerTimer = 0;

let images = [];

function preload() {
    images.push(loadImage("assets/help/examplegun.png"));
    images.push(loadImage("assets/help/sidebar.png"))
    images.push(loadImage("assets/help/placeanddelete.png"))
    images.push(loadImage("assets/help/attach.png"))
}

function setup() {
    // put setup code here
    canvas = createCanvas(windowWidth, windowHeight);
}

function draw() {
    clear();
    background(0, 200);
    push();
    fill(255)
    noStroke();
    textSize(30);
    textAlign(CENTER, TOP);
    switch (clicker) {
        case 0:
            text("Welcome to the Gun Mixer!", width/2, 40);
            textSize(22);
            text("Mix & match the parts of a variety of guns, and take bliss in ignoring how guns actually work.\n\nNo really, what you will make here will defy the mechanics of guns. We'll make it work, however.\n\nClick to continue", width/2-300, 80, 600);
            imageMode(CENTER);
            image(images[0], width/2, 500, images[0].width*0.5, images[0].height*0.5);
            break;
        case 1:
            text("Using the Workspace", width/2, 40);
            textSize(22);
            text("The workspace is the light gridded area on the right of the screen. It is where you see your parts and where you move and attach them.\nThere are a few controls:\nLeft Click (drag): Move parts\nRight Click (drag): Move camera\nScroll: Zoom in/out", width/2-300, 80, 600);
            break;
        case 2:
            text("Finding Parts", width/2, 40);
            textSize(22);
            text("On the left, you will see a sidebar. Click through the category tabs to see your options. Some tabs may have too many items to display on your screen, in which you will need to scroll. Those tabs show a scrollbar on the left side when you first click them.", width/2-300, 80, 600);
            imageMode(CENTER);
            image(images[1], width/2, 520, images[1].width*0.6, images[1].height*0.6);
            break;
        case 3:
            text("Placing Parts", width/2, 40);
            textSize(22);
            text("When you find a part you want to use, click and drag a part off of the sidebar. This will place it into the workspace. You can also drag parts onto the sidebar from the workspace to delete them.", width/2-300, 80, 600);
            imageMode(CENTER);
            image(images[2], width/2, 500, images[2].width*0.65, images[2].height*0.65);
            break;
        case 4:
            text("Attaching Parts", width/2, 40);
            textSize(22);
            text("Parts can be attached if you bring one close to a valid location on another part. When you attach parts, you can drag the smaller (child) part to detach. Dragging the bigger (parent) part will move them all.", width/2-300, 80, 600);
            imageMode(CENTER);
            image(images[3], width/2, 500, images[3].width*1, images[3].height*1);
            break;
    }
    pop();
    push();
    if (clickerTimer > 0) {
        clickerTimer -= deltaTime/1000;
    }
    if (clickerTimer < 0) {
        clickerTimer = 0;
    }
    textAlign(LEFT, TOP);
    textSize(100);
    fill(255, 255*clickerTimer);
    text(clicker+1, 10, 10);
    pop();

    push();
    noStroke();
    fill(255, 66, 66);
    if (mouseX > width-50 && mouseY < 50) {
        fill(255, 100, 100);
    }
    let size = 50
    rect(width-size, 0, size, size, 0, 0, 0, 15);
    strokeWeight(5);
    stroke(0);
    let linePadding = 15;
    line(width-(size-linePadding), linePadding, width-linePadding, size-linePadding);
    line(width-(size-linePadding), size-linePadding, width-linePadding, linePadding);
    pop();
}

function mouseClicked() {
    if (mouseX > width-50 && mouseY < 50) {
        window.parent.postMessage("closeMePlease");
        return;
    }
    clicker ++;
    clickerTimer = 1;
    if (clicker > 4) {
        clicker = 0;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
