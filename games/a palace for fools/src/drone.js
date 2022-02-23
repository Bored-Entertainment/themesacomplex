import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Drone. Flies and shoots
//
// (c) 2019 Jani Nykänen
//


const INITIAL_WAIT = 30;


export class Drone extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 12;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.005;
        this.acc.y = 0.005;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(11, 0);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.timer = INITIAL_WAIT;
        this.shootTimer = 0;

        this.ignoreLadder = true;
        this.preventLeaving = true;
    }


    // Reset
    reset() {

        this.timer = INITIAL_WAIT;
    }


    // Update AI
    updateAI(pl, ev, bgen) {

        const SHOOT_TIME = 120;
        const WAIT_TIME = 10;
        const FLY_SPEED = 1.0;
        const BULLET_SPEED = 2.0;
        const EPS = 0.1;

        this.target.x = 0;
        this.target.y = 0;

        let angle = Math.atan2(
            this.pos.y-pl.pos.y,
            this.pos.x-pl.pos.x);
        let len = Math.hypot(this.speed.x, this.speed.y);

        // Update shoot timer
        let b;
        if ((this.shootTimer += ev.step) >= SHOOT_TIME) {

            this.shootTimer -= SHOOT_TIME;

            b = bgen.createElement(
                this.pos.x + this.dir * 4, 
                this.pos.y + 5, 
                -Math.cos(angle) * BULLET_SPEED, 
                -Math.sin(angle) * BULLET_SPEED, 3);
            if (b != null) {

                ev.audio.playSample(ev.audio.sounds.shootBig, 0.50);

                // This way we prevent bullets
                // going through walls
                b.oldPos.x = this.pos.x;
                b.oldPos.y = this.pos.y;
            }
        }


        if (this.timer > 0) {

            this.timer -= 1.0 * ev.step;
            if (this.timer <= 0.0) {

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

        this.spr.animate(11, 0, 3, speed, ev.step);
    }
}
