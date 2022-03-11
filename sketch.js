/// <reference path="types/global.d.ts"/>


let workspace;

let canvas;

let categories;

let helpEle;

let sounds;

let music;

let musicPlaying = false;

function preload() {
  categories = loadJSON("categories.json");
  sounds = loadJSON("assets/sound/sounds.json");
  music = createAudio("assets/sound/music.mp3");

}

function setup() {
  // put setup code here
  canvas = createCanvas(windowWidth, windowHeight);
  workspace = new FrontEndWorkspace();
  pInput.registerCanvas(canvas);
  pInput.registerWorkspace(workspace);
  workspace.addTool(new HandTool());
  workspace.selectTool(workspace.tools[0]);
  music.volume(0.2);
}

function mouseClicked() {
  if (!musicPlaying) {
    music.loop();
    musicPlaying = true;
  }
}

function draw() {
  background(220);
  workspace.update();
  workspace.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  workspace.cacheMouseArea = null;
}

function openHelp() {
  if (!helpEle) {
    helpEle = document.createElement("iframe");
  helpEle.src = "helppage.html";
  document.body.appendChild(helpEle);
  }
}

window.addEventListener("message", (e) => {
  if (e.data == "closeMePlease") {
    helpEle.remove();
    helpEle = null;
  }
})

let audioCache = {};

function playSound(event, repeatsLeft, count) {
  if (sounds.events[event]) {
    let e = sounds.events[event]
    let r = repeatsLeft;
    let firstPlay = false;
    if (!repeatsLeft) {
      r = e.repeatCount;
      firstPlay = true;
    }
    if (!count) {
      count = 0;
    }
    setTimeout(() => {
      let use;
      switch (e.repeatType) {
        case "random":
          use = floor(random(0, e.sounds.length-0.01));
          break;
        case "sequential":
          use = count % e.sounds.length;
          break;
        default:
          use = 0;
          break;
      }
      let audio;
      if (!audioCache[e.sounds[use]]) {
        audioCache[e.sounds[use]] = "loading";
        audio = createAudio(sounds.sounds[e.sounds[use]].path, () => {
          audioCache[e.sounds[use]] = audio;
          audio.play();
        });
      } else {
        if (audioCache[e.sounds[use]] != "loading") {
          audio = audioCache[e.sounds[use]];
          audio.play();
        }
        
      }
      
      if (audio) {
        let pitch = e.pitch + (e.pitchVariance*random(-1,1));
        let volume = e.volume + (e.volumeVariance*random(-1,1));
        audio.speed(pitch);
        audio.volume(volume);
      }
      
      if (r-1 > 0) {
        playSound(event, r-1, count+1)
      }
    }, firstPlay ? 0 : e.repeatDelay)
  }
}