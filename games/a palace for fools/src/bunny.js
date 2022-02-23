import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Like clam, but does not try to reach the player
//
// (c) 2019 Jani Nykänen
//


const WAIT_TIME = 60;


export class Bunny extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.1;
        this.acc.y = 0.1;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(14, 0);

        this.dir = ((this.pos.x/16)|0) % 2 == 0 ? -1 : 1;
        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        this.center.y = -1;
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

        const GRAVITY = 1.5;
        const JUMP_HEIGHT = -2.5;
        const SPEED = 0.5;

        this.target.y = GRAVITY;

        // On ground, wait for jump
        if (this.canJump) {

            this.target.x = 0;

            this.waitTimer -= ev.step;
            if (this.waitTimer <= 0.0) {

                this.waitTimer += WAIT_TIME;
                this.speed.y = JUMP_HEIGHT;

                this.target.x = this.dir * SPEED;
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

        const EPS = 0.5;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        if (this.canJump || Math.abs(this.speed.y) < EPS) {

            this.spr.setFrame(14, 0);
        }
        else {

            this.spr.setFrame(14, this.speed.y < 0 ? 1 : 2);
        }
    }
}
