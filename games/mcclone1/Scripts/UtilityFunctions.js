// Utility Functions

function Create2DArray(x, y, fill = 0) {
    var arr = new Array(x);

    for (var a = 0; a < x; a++) {
        arr[a] = [];

        for (var b = 0; b < y; b++) {
            arr[a][b] = fill;
        }
    }

    return arr;
}

function Create3DArray(x, y, z, fill = 0) {
    var arr = new Array(x);

    for (var a = 0; a < x; a++) {
        arr[a] = [];

        for (var b = 0; b < y; b++) {
            arr[a][b] = [];

            for (var c = 0; c < z; c++) {
                arr[a][b][c] = fill;
            }
        }
    }

    return arr;
}

function Create4DArray(x, y, z, slots, fill = 0) {
    var arr = new Array(x);

    for (var a = 0; a < x; a++) {
        arr[a] = [];

        for (var b = 0; b < y; b++) {
            arr[a][b] = [];

            for (var c = 0; c < z; c++) {
                arr[a][b][c] = [];

                for (var d = 0; d < slots; d++) {
                    arr[a][b][c][d] = fill;
                }
            }
        }
    }

    return arr;
}


function RandomChance(percent){
    if(Math.random() < percent){
      return true;
    }
    else{
      return false;
    }
}

function RandomSign() {
    if (Math.random() > 0.5) {
        return 1;
    }
    else {
        return -1;
    }
}

function RandomBool() {
    if (Math.random() > 0.5) {
        return true;
    }
    else {
        return false;
    }
}

function RandomInt(inclusiveMin, inclusiveMax) {
    let difference = inclusiveMax - inclusiveMin;
    return Math.trunc(Math.random() * (difference + 1)) + inclusiveMin;
}

function WeightedRandomChoice(weights) {
    // Given a set of relative weights, use the weights to choose a random one and return its index
    let weightTotal = SumArray(weights);
    let randomNum = Math.random() * weightTotal;
    let currentThreshold = 0;

    for(let i = 0; i < weights.length; i++){
        currentThreshold += weights[i];

        if(randomNum < currentThreshold){
            return i;
        }
    }
}


function SumArray(array){
    // Returns the sum of all elements in this array
    let sum = 0;
    for(let i = 0; i < array.length; i++){
        sum += array[i];
    }

    return sum;
}

function MultiplyArrayElements(array1, array2){
    // Returns the sum of all elements in this array
    let result = new Array(array1.length);
    for(let i = 0; i < array1.length; i++){
        result[i] = array1[i] * array2[i];
    }

    return result;
}


function DegToRad(deg){
    let rad = deg * Math.PI / 180;
    return rad;
}

function RadToDeg(rad){
    let deg = rad * 180 / Math.PI;
    return deg;
}

function ClampValue(value, minimum, maximum) {
    let clampedVal = Math.min(maximum, Math.max(minimum, value));
    return clampedVal;
}


function Unflatten3DGrid(index, width){
    // Converts a single index into a 3D integer coordinate trio, given the dimensions of a square grid to pick from
    // Coordinates are mapped in the order (x, z, y), but a standard xyz vector is returned
    let maxIndex = width * width * width - 1;
    if (index > maxIndex){
        return; }

    let x = index % width;
    let z = Math.trunc(index / width) % width;
    let y = Math.trunc(index / (width * width));

    let coords = new BABYLON.Vector3(x, y, z);
    return coords;
}


function MapRange(value, inLow, inHigh, outLow, outHigh){
    // Re-maps value from the in-range to the out-range
    let inRange = inHigh / inLow;
    let outRange = outHigh - outLow;

    let inPercent = (value - inLow) / (inRange);
    let outMap = outLow + (inPercent * outRange);

    return outMap;
}