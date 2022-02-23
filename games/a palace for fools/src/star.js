import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// Star-shaped enemy
//
// (c) 2019 Jani Nykänen
//


export class Star extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 8;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.0;
        this.acc.y = 0.0;

        this.isStatic = true;

        this.setSpeed();

        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.power = 2;

        this.spr.setFrame(12, 0);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.ignoreLadder = true;
        this.preventLeaving = true;
    }


    // Reset
    reset() {

        this.setSpeed();
    }


    // Set initial speeed
    setSpeed() {

        const BASE_SPEED = 0.5;

        this.speed.x = BASE_SPEED * (((this.pos.x/16)|0) % 2 == 0 ? 1 : -1);
        this.speed.y = BASE_SPEED * (((this.pos.y/16)|0) % 2 == 0 ? 1 : -1);
    }


    // Update AI
    updateAI(pl, ev) {
 
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 8;

        this.spr.animate(12, 0, 1, ANIM_SPEED, ev.step);
    }
}
