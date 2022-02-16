/// <reference path="types/global.d.ts"/>

let defaultPart = {
    name: "",
    type: "default",
    image: "",
    attachments: []
}

let currPart;

function setup() {
    // put setup code here
    createCanvas(windowWidth - 260, windowHeight - 20);
}

function draw() {
    // put drawing code here
    background(51);

}

function windowResized() {
    resizeCanvas(windowWidth - 260, windowHeight - 20);
}

function newPart() {
    let name = prompt("Enter a name for the part.");
    let type = prompt("Enter the part's type.");
    let image = prompt("Enter an image path for the part.");
    let newPart = Object.assign({}, defaultPart);
    newPart.name = name;
    newPart.type = type;
    newPart.image = image;
    currPart = new Part(newPart);
}
