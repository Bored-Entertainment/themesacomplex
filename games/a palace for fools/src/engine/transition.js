import { Vector2 } from "./vector.js";

//
// Transition manager. For managing
// (and rendering) scene etc. transitions
//
// (c) 2019 Jani Nykänen
//

const TRANSITION_TIME = 60;


export const TransitionMode = {

    Empty: -1,
    Fade: 0,
    VerticalBar: 1,
    HorizontalBar: 2,
    CircleOutside: 3,
    CircleInside: 4,
}


export class Transition {


    constructor() {

        this.timer = 0;
        this.cb = null;
        this.color = {r: 0, g: 0, b: 0};
        this.active = false;
        this.speed = 1;
        this.fadeIn = false;
        this.mode = TransitionMode.Fade;

        this.center = null;
    }


    // Make the transition active
    activate(fadeIn, mode, speed, cb, r, g, b) {

        if (r == null) {

            r = 0; g = 0; b = 0;
        }

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        this.timer = TRANSITION_TIME;
        this.cb = cb;
        this.mode = mode;

        this.active = true;
    }


    // Set center
    setCenter(cx, cy) {

        if (cx == null || cy == null) {

            this.center = null;
        }
        else {

            this.center = new Vector2(cx, cy);
        }
    }


    // Update transition
    update(ev) {

        if (!this.active) return;

        // Update timer
        if ((this.timer -= this.speed * ev.step) <= 0) {

            if ((this.fadeIn = !this.fadeIn) == false) {

                this.cb(ev);
                this.timer += TRANSITION_TIME;
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    // Draw transition
    draw(c) {

        if (!this.active || this.delayTimer > 0 || this.mode == -1) 
            return;

        c.moveTo(0, 0);

        let t = this.getScaledTime();
        let r, w, h;

        // Radius must be great enough so that
        // the circle area (or its complement)
        // does not vanish too early
        let maxRadius = this.center == null ? 0 : 
            Math.max(
                Math.hypot(this.center.x, this.center.y),
                Math.hypot(c.w-this.center.x, this.center.y),
                Math.hypot(c.w-this.center.x, c.h-this.center.y),
                Math.hypot(this.center.x, c.h-this.center.y)
            );

        switch(this.mode) {

        case TransitionMode.Fade:

            c.setAlpha(t);
            c.clear(this.color.r, this.color.g, this.color.b);
            c.setAlpha();
            
            break;

        case TransitionMode.VerticalBar:

            w = c.w;
            h = (t * c.h/2) | 0;

            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillRect(0, 0, w, h);
            c.fillRect(0, c.h-h, w, h);

            break;

        case TransitionMode.HorizontalBar:

            w = (t * c.w/2) | 0;
            h = c.h;

            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillRect(0, 0, w, h);
            c.fillRect(c.w-w, 0, w, h);

            break;

        case TransitionMode.CircleOutside:

            if (this.center == null) {

                this.center = new Vector2(c.w/2, c.h/2);
            }
            
            r = (1-t) * maxRadius;
            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillCircleOutside(r, this.center.x, this.center.y);

            break;

        case TransitionMode.CircleInside:

            if (this.center == null) {

                this.center = new Vector2(c.w/2, c.h/2);
            }

            r = t * maxRadius;
            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillCircle(r, this.center.x, this.center.y);

            break;

        default:
            break;
        }
    }


    // Get time scaled to [0,1] interval
    getScaledTime() {

        let t = this.timer / TRANSITION_TIME;
        if (this.fadeIn) t = 1.0 - t;
        return t;
    }


    // Disable
    disable() {

        this.active = false;
    }
}
