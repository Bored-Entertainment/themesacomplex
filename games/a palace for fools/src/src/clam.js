import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A jumping clam
//
// (c) 2019 Jani Nykänen
//


const WAIT_TIME = 30;


export class Clam extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 10;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.1;
        this.acc.y = 0.1;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(13, 0);

        this.dir = -1;

        this.center.y = -2;
        this.pos.y -= this.center.y - 1;
        this.startPoint.y = this.pos.y;
        this.canJump = true;

        this.bounce = true;
        this.bounceFactor.x = 1;

        this.waitTimer = WAIT_TIME;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        const GRAVITY = 2.0;
        const JUMP_HEIGHT = -1.5;
        const JUMP_MOD = 3.0;
        const SPEED = 0.5;
        const SPEED_MOD = 0.70;

        this.target.y = GRAVITY;

        // On ground, wait for jump
        if (this.canJump) {

            this.target.x = 0;

            this.waitTimer -= ev.step;
            if (this.waitTimer <= 0.0) {

                this.waitTimer += WAIT_TIME;
                this.speed.y = JUMP_HEIGHT + 
                    Math.min(0, (pl.pos.y-this.pos.y)/144*JUMP_MOD);

                this.dir = pl.pos.x < this.pos.x ? -1 : 1;

                this.target.x = 
                    (SPEED + (Math.abs(pl.pos.x-this.pos.x)/160*SPEED_MOD))
                    * this.dir;
                this.speed.x = this.target.x;

                ev.audio.playSample(ev.audio.sounds.jump, 0.40);
            }
        }
        else {

            this.target.x = this.speed.x;
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 5;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        if (this.canJump) {

            this.spr.setFrame(13, 0);
        }
        else {

            this.spr.animate(13, 1, 4, ANIM_SPEED, ev.step);
        }
    }
}
