import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";


//
// A slime that... drops. Hence a slimedrop.
//
// (c) 2019 Jani Nykänen
//


export class SlimeDrop extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 8;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.0;
        this.acc.y = 0.15;

        this.maxHealth = 1;
        this.health = this.maxHealth;

        this.spr.setFrame(8, 0);

        this.flip = Flip.None;

        this.isStatic = true;
        this.active = false;
        this.disappearing = false;
        
        this.power = 1;

        this.applyShake = false;
    }


    // Reset
    reset() {

        this.disappearing = false;
        this.active = false;
        this.spr.frame = 0;
    }


    // Update AI
    updateAI(pl, ev) {

        const GRAVITY = 4.0;
        const GROW_SPEED = 10;
        const SPLASH_SPEED = 6;
        const WAIT_TIME = 60;

        this.target.y = 0;
        this.harmless = !this.active || this.disappearing;

        // Disappear
        if (this.disappearing) {

            this.speed.y = 0;

            this.spr.animate(8, 4, 8, 
                this.spr.frame == 7 ? WAIT_TIME : SPLASH_SPEED, 
                ev.step);
            if (this.spr.frame == 8) {

                this.spr.setFrame(8, 0);
                this.pos = this.startPoint.clone();
                this.disappearing = false;
                this.active = false;
            }

            return;
        }

        // Animate appearing
        if (!this.active) {

            this.speed.y = 0;

            this.spr.animate(8, 0, 4, GROW_SPEED, ev.step);
            if (this.spr.frame == 4) {

                this.spr.setFrame(8, 3);
                this.active = true;
            }
        }
        // Drop
        else {

            this.target.y = GRAVITY;
            if (this.canJump) {

                this.disappearing = true;
                ev.audio.playSample(ev.audio.sounds.bulletHit, 0.40);
            }
        }
    }


    // Animate
    animate(ev) {

        // ...
    }
}
