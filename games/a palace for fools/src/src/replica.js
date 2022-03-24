import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A clone of the player character
//
// (c) 2019 Jani Nykänen
//


export class Replica extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 10;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.025;
        this.acc.y = 0.1;

        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.power = 1;

        this.spr.setFrame(9, 0);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.center.y = -2;
        this.pos.y -= this.center.y -1;
        this.startPoint.y = this.pos.y;
        this.canJump = true;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        const SPEED = 0.75;
        const GRAVITY = 1.5;
        const JUMP_HEIGHT_COMP = 24.0;
        const JUMP_HEIGHT_MUL = -1.0;
        const JUMP_MIN = -1.5;
        const JUMP_BASE = -1.25;
        const V_DIF = 12;
        const H_DIF = 0.25;

        if (this.canJump || this.oldCanJump) {

            this.dir = pl.pos.x < this.pos.x ? -1 : 1;
        }

        this.target.x = this.dir * SPEED;
        this.target.y = GRAVITY;

        if (this.canJump &&
            pl.pos.y < this.pos.y-V_DIF &&
            Math.abs(this.speed.x) < H_DIF) {

            this.speed.y += JUMP_BASE + Math.max(JUMP_MIN,
                (this.pos.y-pl.pos.y) / 
                JUMP_HEIGHT_COMP * JUMP_HEIGHT_MUL);

            ev.audio.playSample(ev.audio.sounds.jump, 0.40);
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 6;
        const EPS = 0.5;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        let frame = 5;
        if (this.canJump) {

            this.spr.animate(9, 0, 3, 
                ANIM_SPEED, ev.step);
        }
        else {

            if (this.speed.y < -EPS)
                frame = 6;
            else if (this.speed.y > EPS)
                frame = 4;

            this.spr.setFrame(9, frame);
        }
    }
}
