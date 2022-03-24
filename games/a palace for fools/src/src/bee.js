import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Bee. Flies without too much
// logic.
//
// (c) 2019 Jani Nykänen
//


const INITIAL_WAIT = 30;


export class Bee extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 12;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(4, 0);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.timer = INITIAL_WAIT;

        this.ignoreLadder = true;
        this.preventLeaving = true;
    }


    // Reset
    reset() {

        this.timer = INITIAL_WAIT;
    }


    // Update AI
    updateAI(pl, ev) {

        const WAIT_TIME = 10;
        const FLY_SPEED = 1.0;
        const EPS = 0.1;

        this.target.x = 0;
        this.target.y = 0;

        let angle;
        let len = Math.hypot(this.speed.x, this.speed.y);

        if (this.timer > 0) {

            this.timer -= 1.0 * ev.step;
            if (this.timer <= 0.0) {

                angle = Math.atan2(
                    this.pos.y-pl.pos.y,
                    this.pos.x-pl.pos.x);
    
                this.speed.x = -Math.cos(angle) * FLY_SPEED;
                this.speed.y = -Math.sin(angle) * FLY_SPEED;
            }
        }
        else if (len < EPS) {

            this.timer = WAIT_TIME;
        }
    }


    // Animate
    animate(ev) {

        let speed = 6 - Math.hypot(this.speed.x, this.speed.y) * 4;

        this.spr.animate(4, 0, 3, speed, ev.step);
    }
}
