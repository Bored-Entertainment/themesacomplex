import { Vector2 } from "./vector.js";
import { getColorString, clamp } from "./util.js";

//
// Canvas
// Not Html5 canvas (although this class
// contains is), but an "abstract" canvas
// where all the rendering happens so that
// the user does not have to know which
// rendering method is used
// (c) 2019 Jani Nykänen
//


// Flipping flags
export const Flip = {

    None : 0,
    Horizontal : 1,
    Vertical : 2,
    Both : 3, // == 1 | 2
};



export class Canvas {


    constructor(w, h) {

        this.canvas = null;
        this.ctx = null;

        // Just for laziness we store them here
        this.w = w;
        this.h = h;

        // Transformation
        this.tr = new Vector2(0, 0);
        // Shaking
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;

        // Create the canvas
        this.createHtml5Canvas(w, h);

        // Black screen by default
        this.clear(0, 0, 0);

        // Set the proper size for the canvases (style-wise)
        this.resize(window.innerWidth, window.innerHeight);

        
    }


    // Create the Html5 canvas (and div where
    // it's embedded)
    createHtml5Canvas(w, h) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1");

        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        // Get 2D context and disable image smoothing
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }


    // Called when the window is resized (and in the creation)
    resize(w, h) {

        let c = this.canvas;
        let x, y;
        let width, height;

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (w / c.width) | 0, 
            (h / c.height) | 0);
            
        // Compute properties
        width = c.width * mul;
        height = c.height * mul;
        x = w/2 - width/2;
        y = h/2 - height/2;
        
        // Set style properties
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.height = String(height | 0) + "px";
        c.style.width = String(width | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }


    // Set shaking
    setShake(time, mag) {

        if (this.shakeTimer > 0) return;

        this.shakeTimer = time;
        this.shakeMagnitude = mag;
    }


    // Update canvas
    update(ev) {

        if (this.shakeTimer > 0) {

            this.shakeTimer -= ev.step;
        }
    }


    // Clear screen with a color
    clear(r, g, b, a) {

        this.setColor(r, g, b, a);
        this.fillRect(0, 0, this.w, this.h);
    }


    // Set global rendering color
    setColor(r, g, b, a) {

        let s = getColorString(r, g, b, a);
        this.ctx.fillStyle = s;
        this.ctx.strokeStyle = s;
    }


    // Draw a filled rectangle
    fillRect(x, y, w, h) {

        let c = this.ctx;

        // Apply translation
        x += this.tr.x;
        y += this.tr.y;

        c.fillRect(x, y, w, h);
    }


    // Draw a full bitmap
    drawBitmap(bmp, dx, dy, flip) {

        this.drawBitmapRegion(bmp, 
            0, 0, bmp.w, bmp.h,
            dx, dy, flip);
    }

    
    // Draw a bitmap region
    drawBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, flip) {

        if (sw <= 0 || sh <= 0) 
            return;

        let c = this.ctx;

        let dw = sw;
        let dh = sh;
            
        // Apply translation
        dx += this.tr.x;
        dy += this.tr.y;

        // Only integer positions etc. are
        // allowed
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;

        dx |= 0;
        dy |= 0;

        flip = flip | Flip.None;
        
        // If flipping, save the current transformations
        // state
        if (flip != Flip.None) {
            c.save();
        }

        // Flip horizontally
        if ((flip & Flip.Horizontal) != 0) {

            c.translate(dw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        // Flip vertically
        if ((flip & Flip.Vertical) != 0) {

            c.translate(0, dh);
            c.scale(1, -1);
            dy *= -1;
        }

        c.drawImage(bmp.img, sx, sy, sw, sh, dx, dy, dw, dh);

        // ... and restore the old
        if (flip != Flip.None) {

            c.restore();
        }
    }


    // Draw scaled text
    drawText(font, str, dx, dy, xoff, yoff, center) {

        let cw = font.w / 16;
        let ch = cw;

        let x = dx;
        let y = dy;
        let c;

        if (center) {

            dx -= (str.length * (cw + xoff))/ 2.0 ;
            x = dx;
        }

        // Draw every character
        for (let i = 0; i < str.length; ++ i) {

            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {

                x = dx;
                y += ch + yoff;
                continue;
            }

            // Draw the current character
            this.drawBitmapRegion(
                font, 
                (c % 16) * cw, ((c/16)|0) * ch,
                cw, ch, 
                x, y);

            x += cw + xoff;
        }
    }


    // Draw a sprite frame (another way)
    drawSpriteFrame(spr, bmp, frame, row, x, y, flip)  {

        spr.drawFrame(this, bmp, frame, row, x, y, flip);
    }


    // Draw a sprite (another way)
    drawSprite(spr, bmp, x, y, flip)  {

        spr.draw(this, bmp, x, y, flip);
    }


    // Translate the rendering point
    translate(x, y) {

        this.tr.x += x;
        this.tr.y += y;
    }


    // Set the rendering point to the given
    // coordinates
    moveTo(x, y) {

        this.tr.x = x;
        this.tr.y = y;
    }


    // Translate the rendering point
    move(x, y) {

        this.tr.x += x;
        this.tr.y += y;
    }


    // Use shaking
    useShake() {

        if (this.shakeTimer <= 0) return;

        let dx = ( (Math.random()-0.5)*2 * this.shakeMagnitude);
        let dy = ( (Math.random()-0.5)*2 * this.shakeMagnitude);

        this.move(dx, dy);
    }


    // Set global alpha
    setAlpha(a) {

        if (a == null) a = 1.0;

        this.ctx.globalAlpha = clamp(a, 0, 1);
    }


    // Fill the area outside a circle
    fillCircleOutside(r, cx, cy) {

        if (r <= 0) {

            this.fillRect(0, 0, this.w, this.h);
            return;
        }
        else if (r*r >= this.w*this.w + this.h*this.h) {

            return;
        }

        if (cx == null)
            cx = this.w / 2;
        if (cy == null)
            cy = this.h / 2;

        
        let start = Math.max(0, cy - r) | 0;
        let end = Math.min(this.h, cy + r) | 0;

        // Draw rectangle areas
        if (start > 0)
            this.fillRect(0, 0, this.w, start);

        if (end < this.h)
            this.fillRect(0, end, this.w, this.h-end);

        // Draw the  circle area line by line
        let dy;
        let px1, px2;
        for (let y = start; y < end; ++ y) {

            dy = y - cy;

            // A full line
            if (Math.abs(dy) >= r) {

                this.fillRect(0, y, this.w, 1);
                continue;
            }

            px1 = cx - Math.sqrt(r*r - dy*dy);
            px2 = cx + Math.sqrt(r*r - dy*dy);

            px1 |= 0;
            px2 |= 0;

            // Fill left
            if (px1 > 0)
                this.fillRect(0, y, px1, 1);
            // Fill right
            if (px2 < this.w)
                this.fillRect(px2, y, this.w-px1, 1);
        }
    }


    // Fill a circle
    fillCircle(r, cx, cy) {

        if (r <= 0) {

            return;
        }
        else if (r*r >= this.w*this.w + this.h*this.h) {

            this.fillRect(0, 0, this.w, this.h);
            return;
        }

        if (cx == null)
            cx = this.w / 2;
        if (cy == null)
            cy = this.h / 2;

        let start = Math.max(0, cy - r) | 0;
        let end = Math.min(this.h, cy + r) | 0;

        // Draw the circle area line by line
        let dy, w;
        for (let y = start; y < end; ++ y) {

            dy = y - cy;
            
            w = (Math.sqrt(r*r - dy*dy) | 0) * 2;

            this.fillRect(cx-w/2, y, w, 1);
        }
    }
}
