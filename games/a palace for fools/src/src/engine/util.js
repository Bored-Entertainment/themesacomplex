import { Vector3 } from "./vector.js";

//
// Simple utility functions
// (c) 2019 Jani Nykänen
//



// Negative modulo
export function negMod(m, n) {

    if(m < 0) {

        return n - (-m % n);
    }
    return m % n;
}


// Clamp a number to the range [min, max]
export function clamp(x, min, max) {

    return Math.max(min, Math.min(x, max));
}


// Toggle fullscreen
export function toggleFullscreen(canvas) {

    // console.log("No.");

    if(document.webkitIsFullScreen || 
        document.mozFullScreen) {

        if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();

        else if(document.exitFullscreen)
            document.exitFullscreen();    
    }
    else {

        if(canvas.webkitRequestFullscreen)
            canvas.webkitRequestFullscreen();

        else if(canvas.requestFullscreen) 
            canvas.requestFullscreen();

        else if(canvas.mozRequestFullScreen) 
            canvas.mozRequestFullScreen();
        
    }
}


// Is a point inside a triangle
export function isInsideTriangle(
    px, py, x1, y1, x2, y2, x3, y3) {

    let as_x = px-x1;
    let as_y = py-y1;
    let s_ab = (x2-x1)*as_y-(y2-y1)*as_x > 0;

    return !(((x3-x1)*as_y-(y3-y1)*as_x > 0) == s_ab || 
        ((x3-x2)*(py-y2)-(y3-y2)*(px-x2) > 0) != s_ab);
}


// Cross-product
export function cross(a, b) {

    return new Vector3(
        a.y*b.z - b.y*a.z,
        a.z*b.x - b.z*a.x,
        a.x*b.y - b.x*a.y
    );
}

// Dot product
export function dot(a, b) {

    return a.x*b.x + a.y*b.y + a.z*b.z;
}


// A helper function that updates a 
// "speed axis", like actual speed or
// angle speed
export function updateSpeedAxis(speed, target, d) {

    if (speed < target) {

         speed = Math.min(speed + d, target);
    }
    else if (speed > target) {

        speed = Math.max(speed - d, target);
    }
    return speed;
}


// Convert RGBA values to a string that is 
// understood by Html5
export function getColorString(r, g, b, a) {

    if (r == null) r = 255;
    if (g == null) g = r;
    if (b == null) b = g;

    if (a == null) 
        a = 1.0;
    
    return "rgba("
        + String(r | 0) + ","
        + String(g | 0) + ","
        + String(b | 0) + ","
         + String(a) + ")";
}


// Draw box with borders
export function drawBoxWithBorders(c, x, y, w, h, colors) {

    let len = colors.length -1;

    for (let i = len; i >= 0; -- i) {

        c.setColor(colors[len-i]);
        c.fillRect(x-i, y-i,
            w+i*2, h+i*2);
    }
}