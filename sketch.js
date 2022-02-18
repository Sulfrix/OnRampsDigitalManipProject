/// <reference path="types/global.d.ts"/>


// Notes:
// Snapping works, even with rectangles of different sizes.
// Dragging workds, with no glitches as far as I can tell.
//
// Dragging even allows you to grab the top block in a stack,
// and move the block you grab to the top.
//
// Currently, the block connects to the closest one no matter what.
// I have no idea why. It should prioritize blocks it hasn't recently connected to.
// This scares me.



const atch = {
  x: 0, y: 0, direction: 0
}

const square = {
  x: 0, y: 0, sizeX: 0, sizeY: 0,
  clicked: false, clickX: 0, clickY: 0, 
  elipson: 25,
  lastAtch: [],
  atch: [
    Object.assign({}, atch),
    Object.assign({}, atch),
    Object.assign({}, atch),
    Object.assign({}, atch)
  ]
}
square.atch[0].x = 1;
square.atch[0].direction = 0;
square.atch[1].y = 1;
square.atch[1].direction = 90;
square.atch[2].x = -1;
square.atch[2].direction = 180;
square.atch[3].y = -1;
square.atch[3].direction = 270;


let squares = [];
let squareOrder = [];



function setup() {
  // put setup code here
  createCanvas(400, 400);
  
  // Has to be in setup because it uses random
  for(i = 0; i < 10; i++){
    const tempSquare = Object.assign({}, square);
    tempSquare.x = random(0, 320);
    tempSquare.y = random(0, 320);
    tempSquare.sizeX = random(50, 100);
    tempSquare.sizeY = random(50, 100);
    squares.push(tempSquare);
    squareOrder.push(i);
  }
}

function draw() {
  // put drawing code here
  background(200);

  for(index = 0; index < squares.length; index++){
    let i = squareOrder[index];

    if(squares[i].clicked){
      strokeWeight(2);
      rect(
        mouseX - squares[i].clickX, 
        mouseY - squares[i].clickY, 
        squares[i].sizeX, 
        squares[i].sizeY
        );

      /*
      strokeWeight(10);
      for(a = 0; a < squares[i].atch.length; a++){
        point(
          squares[i].x + (1 + squares[i].atch[a].x) * squares[i].size/2,
          squares[i].y + (1 + squares[i].atch[a].y) * squares[i].size/2
        )
      }*/
    }
    else{
      strokeWeight(2);
      rect(
        squares[i].x, 
        squares[i].y, 
        squares[i].sizeX, 
        squares[i].sizeY
        );
        text(i, squares[i].x + squares[i].sizeX/2, squares[i].y + squares[i].sizeY/2);

      // Code for drawing attachment points
      /*
      strokeWeight(8);
      for(a = 0; a < squares[i].atch.length; a++){
        point(
          squares[i].x + (1 + squares[i].atch[a].x) * squares[i].size/2,
          squares[i].y + (1 + squares[i].atch[a].y) * squares[i].size/2
        )
      }*/
    }
    
  }
}

function keyTyped(){

  if(key === 'w' || key === "s"){

    let alreadyClicked = false;

    for(index = 0; index < squares.length; i++){
      let i = squareOrder[index];

      if(
        mouseX > squares[i].x && mouseX < squares[i].x + squares[i].sizeX &&
        mouseY > squares[i].y && mouseY < squares[i].y + squares[i].sizeY &&
        !alreadyClicked
      ){
        alreadyClicked = true;

        if(key === 'w'){
          squares[i].sizeX *= 1.01;
          squares[i].sizeY *= 1.01;
        }
        else if (key === 's'){
          squares[i].sizeX *= 0.99;
          squares[i].sizeY *= 0.99;
        }
      }
    }
  }
}

function mousePressed(){

  let alreadyClicked = false;
  let temp;

  
  for(index = 0; index < squares.length; index++){
    let i = squareOrder[index];

    if(
      mouseX > squares[i].x && mouseX < squares[i].x + squares[i].sizeX &&
      mouseY > squares[i].y && mouseY < squares[i].y + squares[i].sizeY &&
      !alreadyClicked
    ){
      alreadyClicked = true;

      squares[i].clicked = true;
      squares[i].clickX = mouseX - squares[i].x;
      squares[i].clickY = mouseY - squares[i].y;

      squareOrder.splice(index, 1);
      squareOrder.push(i);
    }
  }

  
}

function mouseReleased(){


  for(i = 0; i < squares.length; i++){
    if(squares[i].clicked){
      squares[i].clicked = false;
      squares[i].x = mouseX - squares[i].clickX;
      squares[i].y = mouseY - squares[i].clickY;
      
      let minDist = squares[i].elipson;
      let currentAtch = 999;

      let finalJ;
      let finalA2;
      let finalA1;

      for(a1 = 0; a1 < squares[i].atch.length; a1++){

        for(j = 0; j < squares.length; j++){
          for(a2 = 0; a2 < squares[j].atch.length; a2++){

            let dist = Math.hypot(
            (squares[i].x + (1 + squares[i].atch[a1].x) * squares[i].sizeX/2) - 
            (squares[j].x + (1 + squares[j].atch[a2].x) * squares[j].sizeX/2),
            (squares[i].y + (1 + squares[i].atch[a1].y) * squares[i].sizeY/2) - 
            (squares[j].y + (1 + squares[j].atch[a2].y) * squares[j].sizeY/2));

            let attachProximity = squares[i].lastAtch.findIndex(item => item === [j, a2]);

            if(
              (dist < minDist || (
                dist < squares[i].elipson &&
                attachProximity < currentAtch
              )) &&
              i != j && 
              Math.abs(squares[i].atch[a1].direction - squares[j].atch[a2].direction) == 180
              ){

              currentAtch = attachProximity;
              
              console.log("MinDist: " + minDist + " Dist: " + dist);
              
              if(minDist < dist){
                for(num = 0; num < squares[i].lastAtch.length; num++){
                  console.log(squares[i].lastAtch[num]);
                }
                console.log('');
              }
              
              minDist = dist;
              
              finalJ = j;
              finalA2 = a2;
              finalA1 = a1;
              
              
              /*
              console.log(
                " a1.x: " + (squares[i].x + (1 + squares[i].atch[a1].x) * squares[i].size/2) + 
                " a1.y: " + (squares[i].y + (1 + squares[i].atch[a1].y) * squares[i].size/2) + 
                " a2.x: " + (squares[j].x + (1 + squares[j].atch[a1].x) * squares[j].size/2) + 
                " a2.y: " + (squares[j].x + (1 + squares[j].atch[a1].x) * squares[j].size/2) + 
                " a1: " + a1 + " a2: " + a2 + " i: " + i + " j: " + j
              );*/
            }

            // After this point is for debugging purposes only
            else if(
              i != j && 
                
              ((squares[i].atch[a1].direction == "right" && 
              squares[j].atch[a2].direction == "left") ||
              (squares[i].atch[a1].direction == "up" && 
              squares[j].atch[a2].direction == "down") ||
              (squares[i].atch[a1].direction == "left" && 
              squares[j].atch[a2].direction == "right") ||
              (squares[i].atch[a1].direction == "down" && 
              squares[j].atch[a2].direction == "up"))){

              /*
              console.log(Math.hypot(
                (squares[i].x + (1 + squares[i].atch[a1].x) * squares[i].size/2) - 
                (squares[j].x + (1 + squares[j].atch[a2].x) * squares[j].size/2),
                (squares[i].y + (1 + squares[i].atch[a1].y) * squares[i].size/2) - 
                (squares[j].y + (1 + squares[j].atch[a2].y) * squares[j].size/2)) -
                squares[i].atch[a1].elipson);
              */
              
            }
            else if (i != j){

              //console.log(squares[i].atch[a1].direction + " " + squares[j].atch[a2].direction);
            }
          }
        }
      }

      try{
        squares[i].x = 
          squares[finalJ].x + 
          (1 + squares[finalJ].atch[finalA2].x) * squares[finalJ].sizeX/2 - 
          (1 + squares[i].atch[finalA1].x) * squares[i].sizeX/2;
        squares[i].y = 
          squares[finalJ].y + 
          (1 + squares[finalJ].atch[finalA2].y) * squares[finalJ].sizeY/2 - 
          (1 + squares[i].atch[finalA1].y) * squares[i].sizeY/2;

        squares[i].lastAtch.push([finalJ, finalA2]);
        //console.log("Correct: " + squares[i].atch.length + " Wrong: " + squares[i+1].atch.length);
      }catch (ReferenceError){ 
        // ReferenceErrors are normal here, it just means the square didn't snap to anything
      }
      
    }
  }
}