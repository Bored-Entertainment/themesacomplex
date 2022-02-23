import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";

//
// A bullet
//
// (c) 2019 Jani Nykänen
//


export class Bullet extends GameObject {

    
    constructor() {

        super(0, 0);

        this.exist = false;

        this.w = 8;
        this.h = 1;

        this.spr = new Sprite(16, 16);

        this.dieOnCollision = true;

        this.id = 0;
        this.power = 1;

        this.friendly = true;
    }


    // Die
    die(ev) {

        const DEATH_SPEED = 4;

        this.spr.animate(1 + this.id*2, 
            0, 4, DEATH_SPEED, ev.step);
        if (this.spr.frame == 4)
            this.exist = false;
    }


    // "Control"
    control(ev, extra) {

        let cam = extra[0];

        // Check if outside the camera
        if (this.pos.x-this.w/2 > cam.top.x+cam.w ||
            this.pos.x+this.w/2 < cam.top.x ||
            this.pos.y-this.h/2 > cam.top.y+cam.h ||
            this.pos.y+this.h/2 < cam.top.y) {

            this.exist = false;
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 2;
        const END = [3, 2, 3, 2];

        this.spr.animate(this.id*2, 
            0, END[this.id], 
            ANIM_SPEED, ev.step);
    }


    // Spawn
    spawn(x, y, sx, sy, id, powerUp) {

        const HEIGHT = [2, 8, 2, 8];
        const POWER = [1, 2, 1, 2];

        this.pos.x = x;
        this.pos.y = y;

        this.speed.x = sx;
        this.speed.y = sy;

        this.target = this.speed.clone();

        this.id = id;
        this.power = POWER[this.id];
        if (powerUp != null)
            this.power += powerUp;
            
        this.h = HEIGHT[this.id];

        this.exist = true;
        this.dying = false;
        this.spr.setFrame(this.id*2, 0);
        
        this.breakWall = 2 - id;

        this.friendly = id < 2;
    }


    // Kill
    kill(ev, noSound) {

        if (!noSound) {
            
            // Play sound
            ev.audio.playSample(ev.audio.sounds.bulletHit, 0.40);
        }

        this.dying = true;
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.bullet,
            (this.pos.x | 0) - 8, 
            (this.pos.y | 0) - 8);
    }
}
