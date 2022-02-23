import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";
import { Vector2 } from "./engine/vector.js";

//
// A collectable gem
//
// (c) 2019 Jani Nykänen
//


export class Gem extends GameObject {


    constructor() {

        super(0, 0);

        this.exist = false;

        this.spr = new Sprite(8, 8);

        this.w = 6;
        this.h = 6;

        this.acc.x = 0.01;
        this.acc.y = 0.1;

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 0.9);

        this.id = 0;
    }


    // Spawn
    spawn(x, y, sx, sy, id) {

        const GRAVITY = 2.0;

        this.exist = true;
        this.dying = false;

        this.target.x = 0;
        this.target.y = GRAVITY;

        this.speed.x = sx;
        this.speed.y = sy;

        this.pos.x = x;
        this.pos.y = y;

        this.oldPos = this.pos.clone();

        this.id = id;
    } 


    // Control
    control(ev, extra) {

        this.isInCamera(extra[0]);
    }


    // Animate
    animate(ev) {

        const BASE_SPEED = 8;
        const WAIT_FRAME = 0;
        const WAIT_LENGTH = 60;
        const END = [5, 3];

        if (this.canJump && this.id != 1) return;

        // Determine speed
        let speed = BASE_SPEED;
        if (this.id == 0) {

            speed = 2*BASE_SPEED - 
                Math.floor(this.speed.x)*BASE_SPEED;
        }
        else if (this.id == 1 && 
            this.spr.frame == WAIT_FRAME) {

            speed = WAIT_LENGTH;
        }
            
        if (this.speed.x >= 0 || this.id == 1)
            this.spr.animate(this.id, 
                0, END[this.id], speed, ev.step);
        else 
            this.spr.animate(this.id, 5, 0, speed, ev.step);
    }


    // Check if in camera
    isInCamera(cam) {

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.spr.w/2;
        let h = this.spr.h/2;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py+h >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        if (!this.inCamera)
            this.exist = false;
    }



    // Player collision
    playerCollision(pl, ev) {

        if (!this.exist || pl.dying) return;

        let px = this.pos.x;
        let py = this.pos.y;
        let pw = this.w/2;
        let ph = this.h/2;

        let bx = pl.pos.x;
        let by = pl.pos.y;
        let bw = pl.w/2;
        let bh = pl.h/2;

        let col = 
            px+pw >= bx-bw &&
            px-pw <= bx+bw &&
            py+ph >= by-bh &&
            py-ph <= by+bh;

        if (col) {

            this.exist = false;

            // Gem
            if (this.id == 0) {

                if (pl.gems < 99)
                    ++ pl.gems;
            }
            // Health up
            else if (this.id == 1) {

                pl.health = Math.min(pl.maxHealth, pl.health+1);
            }

            // Play sound
            ev.audio.playSample(
                this.id == 1 ? ev.audio.sounds.life :
                ev.audio.sounds.gem,
                 0.60);
        }
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.gem,
            (this.pos.x-4) | 0,
            (this.pos.y-3) | 0);
    
    }
}