// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var canvas;
var device;
var cam;
var meshes = [];
var lights = [];


var showWires = false;
var showFaces = true;
var drawNormals = false;
var wireOffset = 0.000075;

// r,g,b,a are from 0 to 255
const clear = new BABYLON.Color3(0, 0, 0);
const white = new BABYLON.Color3(255, 255, 255);
const black = new BABYLON.Color3(0, 0, 0);
const red = new BABYLON.Color3(255, 0, 0);
const orange = new BABYLON.Color3(255, 150, 0);
const yellow = new BABYLON.Color3(255, 235, 40);
const green = new BABYLON.Color3(0, 0, 255);
const blue = new BABYLON.Color3(0, 0, 255);
const indigo = new BABYLON.Color3(140, 30, 255);
const synthPink = new BABYLON.Color3(242, 34, 255);
const synthMagenta = new BABYLON.Color3(255, 41, 117);
const lightGray = new BABYLON.Color3(220, 220, 220);
const alphaGrassGreen = new BABYLON.Color3(40, 255, 80);

const sunny = new BABYLON.Color3(255, 252, 211);
const skyBlue = new BABYLON.Color3(133, 216, 237)
const hellishRed = new BABYLON.Color3(208, 11, 11);
const twilightBlue = new BABYLON.Color3(12, 34, 99);
const rainyGray = new BABYLON.Color3(93, 98, 120);
const sunriseGold = new BABYLON.Color3(255, 192, 23);
const sunsetOrange = new BABYLON.Color3(253, 182, 85);
const sunsetPurple = new BABYLON.Color3(112, 34, 241);
const midnightBlue = new BABYLON.Color3(6, 13, 28);

const stoneColor = new BABYLON.Color3(150, 150, 150);
const topsoilColor = new BABYLON.Color3(109, 82, 43);
const brightGrassColor = new BABYLON.Color3(87, 185, 39);
const waterBlueColor = new BABYLON.Color3(22, 85, 222);
const sandColor = new BABYLON.Color3(240, 225, 150);
const woodColor = new BABYLON.Color3(74, 50, 17);
const leafColor = new BABYLON.Color3(61, 140, 21);
const cactusColor = new BABYLON.Color3(124, 168, 0);
const lavaColor = new BABYLON.Color3(255, 82, 35);
const clayColor = new BABYLON.Color3(203, 109, 49);
const cobblestoneColor = new BABYLON.Color3(98, 94, 90);
const snowColor = new BABYLON.Color3(250, 250, 250);
const waterTurquoiseColor = new BABYLON.Color3(68, 151, 128);
const cloudColor = new BABYLON.Color3(211, 220, 236);
const campfireColor = new BABYLON.Color3(255, 180, 56);
const soulfireColor = new BABYLON.Color3(99, 199, 209);
const lightbulbYellowColor = new BABYLON.Color3(255, 254, 211);
const lightFruitGreenColor =  new BABYLON.Color3(90, 171, 26);
const copperOreColor = new BABYLON.Color3(219, 113, 43);
const ironOreColor = new BABYLON.Color3(190, 169, 148);
const cobaltOreColor = new BABYLON.Color3(85, 185, 225);
const goldOreColor = new BABYLON.Color3(237, 209, 28);
const orichalcumOreColor = new BABYLON.Color3(162, 113, 249);
const adamantiumOreColor = new BABYLON.Color3(219, 38, 70);



const LightType = {
    Directional : 0,
    Point : 1,
    Spot : 2
}

const LightingMode = {
    Flat_InverseSquared : 0,
    Flat_Linear : 1,
    Gouraud_Inverse : 2,
    Gouraud_Linear : 3,
    Voxel : 4
}


var ambientLight = 0.075;

var currLightingMode = LightingMode.Voxel;


var deltaTime; // Time, in SECONDS, since last frame.
var lastCalledTime;
var timer = 0;
var fps;
var fpsTimer = 0;

var cycles = 0;
var frameCount = 0;
var smoothFps;
var renderInProgress = false;


document.addEventListener("DOMContentLoaded", init, false);


function init() {
    
    canvas = document.getElementById("frontBuffer");
    cam = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas);

    var placeholderScene = new SoftEngine.Mesh("Scene Placeholder", 0, 0, black, null, 0);
    meshes.push(placeholderScene);

    cam.Position = new BABYLON.Vector3(0, 0, 0);
    cam.Rotation = new BABYLON.Vector3(0, 0, 0);
    cam.Target = new BABYLON.Vector3(0, 0, -1);


    setup();
    
    //fillHierarchy();
    
    var updateLoop = setInterval(renderLoop, 1);
}

function renderLoop() {

    if (renderInProgress === false) {
        cycles += 1;

        if (!lastCalledTime) {
            lastCalledTime = Date.now();
            fps = 0;
            return;
        }

        deltaTime = (Date.now() - lastCalledTime) * 0.001;

        //fps = 1 / deltaTime;
        //document.getElementById("timerStat").innerHTML = "Time: " + timer.toFixed(3);


        // runs the project-specific loop code
        loop();
		
	
        // MAIN DRAWING CALL
        requestAnimationFrame(drawingLoop);


        lastCalledTime = Date.now();
        timer += deltaTime;
        fpsTimer += deltaTime;

        if (fpsTimer >= 1) {
            document.getElementById("fpsStat").innerHTML = "FPS: " + cycles;
            fpsTimer = 0;
            frameCount = 0;
            cycles = 1;
        }

        //Fill the hierarchy with all objects in the scene
        //fillHierarchy();
    }
}

function drawingLoop() {
    renderInProgress = true;
    device.clear();
    device.render(cam, meshes);
    device.present();
    renderInProgress = false;
}

function fillHierarchy(){
    var objectList = "";
  
    objectList += "Meshes:";
    for (var i = 0; i < meshes.length; i++) {
        objectList += "<li>" + i + ": " + meshes[i].name + "</li>";
    }
  
    objectList += "<br> Lights:";
  
    for (var i = 0; i < lights.length; i++) {
        objectList += "<li>" + i + ": " + lights[i].name + "</li>";
    }
    document.getElementById("hierarchy").innerHTML = objectList;
}