import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A flying beetle
//
// (c) 2019 Jani Nykänen
//


export class SkyBeetle extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.05;
        this.acc.y = 0.0;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(10, 0);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.bounce = true;
        this.bounceFactor.x = 1;
        this.bounceFactor.y = 0;

        this.waveTimer = ((x/16)|0) * (Math.PI*2 / 16);
        this.computeY();
    }


    // Reset
    reset() {

        // ...
    }


    // Compute y position
    computeY() {

        const AMPLITUDE = 2.0;

        this.pos.y = this.startPoint.y + 
            Math.sin(this.waveTimer)*AMPLITUDE;
    }


    // Update AI
    updateAI(pl, ev) {

        const SPEED = 0.33;
        const WAVE_SPEED = 0.05;

        this.target.x = this.dir * SPEED;
        this.target.y = 0;

        this.waveTimer += WAVE_SPEED * ev.step;
        this.waveTimer %= Math.PI * 2;

        this.computeY();
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 4;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
        this.spr.animate(10, 0, 3, ANIM_SPEED, ev.step);
    }
}
