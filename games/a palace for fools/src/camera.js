import { Vector2 } from "./engine/vector.js";
import { negMod } from "./engine/util.js";

//
// Simple camera that moves between
// rooms.
//
// (c) 2019 Jani Nykänen
//


export class Camera {


    constructor(x, y, w, h) {

        this.pos = new Vector2(x, y);
        this.target = new Vector2(x, y);
        this.dir = new Vector2(0, 0);

        this.w = w;
        this.h = h;
    
        this.moving = false;
        this.moveTimer = 0;
        this.moveSpeed = 0;
        this.stopped = false;

        this.top = new Vector2(x*w, y*h);

        this.speed = 1;
    }


    // Move by the given delta value
    move(dx, dy, sw, sh, speed) {

        if (this.moving) return;

        this.dir = new Vector2(dx, dy);

        this.target.x = this.pos.x + dx;
        this.target.y = this.pos.y + dy;

        // Determine movement speed
        let len = Math.hypot(dx*this.w, dy*this.h);
        this.speed = 1.0 / (len / speed);

        // Handle looping
        if (this.target.x < 0) {

            this.target.x += sw;
            this.pos.x += sw;
        }
        else if (this.target.x >= sw) {

            this.target.x -= sw;
            this.pos.x -= sw;
        }

        if (this.target.y < 0) {

            this.target.y += sh;
            this.pos.y += sh;
        }
        else if (this.target.y >= sh) {

            this.target.y -= sh;
            this.pos.y -= sh;
        }

        this.moving = true;
        this.moveTimer = 0.0;  
    }


    // Move to the given coordinate, no animation
    forceMoveTo(x, y) {

        this.pos.x = x;
        this.pos.y = y;

        this.target = this.pos.clone();
        this.moving = false;
        this.moveTimer = 0;

        this.top = new Vector2(x*this.w, y*this.h);
    }


    // Update camera
    update(ev) {

        this.stopped = false;
        
        // Update move timer
        if (this.moving) {

            if (( this.moveTimer += this.speed * ev.step) >= 1.0) {

                this.moveTimer = 0;
                this.moving = false;

                this.pos = this.target.clone();

                this.stopped = true;
            }
        }

        // Compute top corner position
        let t = this.moveTimer;
        this.top.x = Math.round((this.pos.x * (1-t) + this.target.x * t) * this.w) | 0;
        this.top.y = Math.round((this.pos.y * (1-t) + this.target.y * t) * this.h) | 0;

        return this.moving;
    }


    // Use camera
    use(c) {

        c.moveTo(-this.top.x, -this.top.y);
    }


    // Focus on an object
    focus(o) {

        this.pos.x = (o.pos.x / this.w) | 0;
        this.pos.y = (o.pos.y / this.h) | 0;

        this.target = this.pos.clone();
        this.moving = false;
    }
}
