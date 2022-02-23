import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Beetle + hat
//
// (c) 2019 Jani Nykänen
//


const WAIT_TIME = 60;



export class HatBeetle extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.05;
        this.acc.y = 0.15;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(15, 0);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.center.y = -1;
        this.pos.y -= this.center.y -1;
        this.startPoint.y = this.pos.y;

        this.bounce = true;
        this.bounceFactor.x = 1;
        this.bounceFactor.y = 0;

        this.oldCanJump = true;
        this.canJump = true;

        this.waitTimer = WAIT_TIME;
        
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev, bgen) {

        const MOUTH_TIME = 20;
        const SPEED = 0.33;
        const GRAVITY = 2.0;
        const BULLET_SPEED = 2.0;

        this.target.x = this.dir * SPEED;
        if (this.oldCanJump && !this.canJump) {

            this.dir *= -1;
            this.target.x *= -1;
            this.pos.x += this.target.x * ev.step;
            this.speed.x = 0.0;
        }
        this.target.y = GRAVITY;

        let oldTime = this.waitTimer;

        // Update shooting
        let b;
        if ((this.waitTimer -= ev.step) <= 0.0) {

            this.waitTimer += WAIT_TIME + MOUTH_TIME;

            // Create a bullet
            b = bgen.createElement(
                this.pos.x + this.dir * 6, 
                this.pos.y + 2, 
                BULLET_SPEED*this.dir, 0,
                2);
            if (b != null) {

                ev.audio.playSample(ev.audio.sounds.shoot, 0.50);

                // This way we prevent bullets
                // going through walls
                b.oldPos.x = this.pos.x;
            }

            this.spr.frame += 4;
        }

        if (this.waitTimer <= WAIT_TIME &&
            oldTime > WAIT_TIME) {

            this.spr.frame -= 4;
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 6;

        let start = this.waitTimer > WAIT_TIME ? 4 : 0;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
        this.spr.animate(15, start, start+3, ANIM_SPEED, ev.step);
    }
}
