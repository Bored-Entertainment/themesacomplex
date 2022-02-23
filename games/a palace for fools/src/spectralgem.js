import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A spectral gem
//
// (c) 2019 Jani Nykänen
//


export class SpectralGem extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 8;

        this.hitArea = new Vector2(6, 6);

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.power = 2;

        this.spr.setFrame(16, 0);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.ignoreLadder = true;
        this.preventLeaving = true;

        this.spcAngle = (y*10 + x) * (Math.PI*2 / 10) % (Math.PI * 2);

        this.offScreenKill = true;
    }


    // Update AI
    updateAI(pl, ev) {

        const FLY_SPEED = 0.5;
        const ANGLE_MOD = 0.5;
     
        this.spcAngle += 0.025 * ev.step;
        this.spcAngle %= Math.PI * 2;

        let angle = Math.atan2(
            this.pos.y-pl.pos.y,
            this.pos.x-pl.pos.x);

        this.target.x = -Math.cos(angle) * FLY_SPEED +
            Math.cos(this.spcAngle) * ANGLE_MOD;
        this.target.y = -Math.sin(angle) * FLY_SPEED +
            Math.sin(this.spcAngle) * ANGLE_MOD;
    }


    // Animate
    animate(ev) {

        let start = this.speed.x < 0 ? 0 : 4;
        let end = this.speed.x < 0 ? 4 : 0;

        let speed = 10 - 8 * Math.hypot(this.speed.x, this.speed.y);

        this.spr.animate(16, start, end, speed, ev.step);
    }
}
