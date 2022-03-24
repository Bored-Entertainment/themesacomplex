import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Not that car, that would break copyright laws,
// but an enemy that looks like a giant bug and
// crawls.
//
// (c) 2019 Jani Nykänen
//


export class Beetle extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.05;
        this.acc.y = 0.15;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(2, 0);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.center.y = -1;
        this.pos.y -= this.center.y -1;
        this.startPoint.y = this.pos.y;

        this.bounce = true;
        this.bounceFactor.x = 1;
        this.bounceFactor.y = 0;

        this.oldCanJump = true;
        this.canJump = true;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        const SPEED = 0.25;
        const GRAVITY = 2.0;

        this.target.x = this.dir * SPEED;
        if (this.oldCanJump && !this.canJump) {

            this.dir *= -1;
            this.target.x *= -1;
            this.pos.x += this.target.x * ev.step;
            this.speed.x = 0.0;
        }
        this.target.y = GRAVITY;
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 6;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
        this.spr.animate(2, 0, 3, ANIM_SPEED, ev.step);
    }
}
