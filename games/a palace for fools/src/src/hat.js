import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A hat that shoots bullets
//
// (c) 2019 Jani Nykänen
//


export class Hat extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 12;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.0;
        this.acc.y = 0.0;
        this.isStatic = true;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(7, 0);
        this.oldFrame = 0;

        this.dir = 1;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev, bgen) {

        const BULLET_SPEED = 2;

        this.dir = pl.pos.x < this.pos.x ? -1 : 1;
        
        // Create a bullet
        let b;
        if (this.oldFrame != this.spr.frame &&
            this.oldFrame == 0) {

            b = bgen.createElement(
                this.pos.x + this.dir * 4, 
                this.pos.y + 5, 
                BULLET_SPEED*this.dir, 0,
                2);
            if (b != null) {

                ev.audio.playSample(ev.audio.sounds.shoot, 0.50);

                // This way we prevent bullets
                // going through walls
                b.oldPos.x = this.pos.x;
            }
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = [60, 20];

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;

        this.oldFrame = this.spr.frame;
        this.spr.animate(7, 0, 1, ANIM_SPEED[this.spr.frame], ev.step);
    }
}
