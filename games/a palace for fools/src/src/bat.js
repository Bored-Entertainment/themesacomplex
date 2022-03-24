import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Bat. Flies towards the player,
// but sleeps at first.
//
// (c) 2019 Jani Nykänen
//


export class Bat extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.015;
        this.acc.y = 0.015;

        this.active = false;
        this.falling = false;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(1, 4);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.ignoreLadder = true;
        this.preventLeaving = true;
    }


    // Reset
    reset() {

        this.active = false;
        this.falling = false;
        this.spr.setFrame(1, 4);
    }


    // Update AI
    updateAI(pl, ev) {

        const TARGET_SPEED = 0.5;
        const TRIGGER_DIST_X = 40;
        const TRIGGER_DIST_Y = 64;
        const ACTIVE_EPS = 0.25;
        const FALL_SPEED = 1.5;

        let angle;
        let dist = Math.abs(this.pos.x - pl.pos.x);

        this.acc.y = this.active ? 0.01 : 0.05;

        this.isStatic = !this.active;

        if (this.active) {

            angle = Math.atan2(
                this.pos.y-pl.pos.y,
                this.pos.x-pl.pos.x);

            this.target.x = -Math.cos(angle) * TARGET_SPEED;
            this.target.y = -Math.sin(angle) * TARGET_SPEED;
        }
        else {

            this.target.x = 0;
            this.target.y = 0;

            if (!this.falling &&
                ((pl.pos.y > this.pos.y &&
                pl.pos.y - this.pos.y < TRIGGER_DIST_Y &&
                dist <= TRIGGER_DIST_X) || 
                this.health < this.maxHealth)
                ) {

                this.speed.y = FALL_SPEED;
                this.falling = true;
            }
            else if (this.falling &&
                this.speed.y <= ACTIVE_EPS) {

                this.falling = false;
                this.active = true;
            }
        }
    }


    // Animate
    animate(ev) {

        if (this.active)
            this.spr.animate(1, 0, 3, 6, ev.step);
        
        else 
            this.spr.setFrame(1, this.falling ? 5 : 4);
    }
}
