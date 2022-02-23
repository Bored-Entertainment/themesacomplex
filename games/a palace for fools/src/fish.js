import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";
import { clamp } from "./engine/util.js";

//
// A swimming fish
//
// (c) 2019 Jani Nykänen
//


export class Fish extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 10;
        this.h = 8;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.05 * 2;
        this.acc.y = 0.0;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(6, 0);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.bounce = true;
        this.bounceFactor.x = 1;
        this.bounceFactor.y = 0;

        this.oldCanJump = true;
        this.canJump = true;

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

        const SPEED = 0.15 * 2;
        const WAVE_SPEED = 0.10;

        let s = Math.sin(this.waveTimer);

        this.target.x = this.dir * SPEED * (0.5+(s+1)*0.5);
        this.target.y = 0.0;

        this.waveTimer += WAVE_SPEED * ev.step;
        this.waveTimer %= Math.PI * 2;

        this.computeY();
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 6;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        let p = 1 - clamp(Math.round(Math.sin(this.waveTimer)*1.1), -1, 1);
        this.spr.setFrame(6, p | 0);
    }
}
