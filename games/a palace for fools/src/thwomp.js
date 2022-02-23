import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";


//
// That thing from Mario, but with slightly different
// graphics, 'cause I don't want to break copyright
// laws!
//
// (c) 2019 Jani Nykänen
//


export class Thwomp extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 14;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.0;
        this.acc.y = 0.20;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(5, 0);

        this.flip = Flip.None;

        this.isStatic = true;
        this.active = false;
        this.returning = false;
        this.waitTimer = 0;

        // TODO: Different damage, if not active
        this.power = 2;

        this.applyShake = false;
    }


    // Reset
    reset() {

        this.active = false;
        this.returning = false;
        this.waitTimer = 0;
    }


    // Update AI
    updateAI(pl, ev) {

        const WAIT_TIME = 60;

        const EPS = 32;
        const GRAVITY = 5.0;
        const RETURN_SPEED = -0.75;

        // Update wait timer
        if (this.waitTimer > 0) {

            this.waitTimer -= 1.0 * ev.step;
        }

        // Not active, wait until player close enough
        if (!this.active) {

            if (Math.abs(pl.pos.x-this.pos.x) < EPS) {

                this.active = true;
            }
        }
        else {

            if (this.returning && this.waitTimer <= 0) {

                // If we returned to the original position
                if (this.pos.y <= this.startPoint.y) {

                    this.active = false;
                    this.returning = false;
                    
                    this.pos.y = this.startPoint.y;

                    return;
                }

                this.target.y = RETURN_SPEED;
                this.speed.y = RETURN_SPEED;
            }
            else {

                this.target.y = GRAVITY;
                if (this.canJump && !this.returning) {

                    this.returning = true;
                    this.waitTimer = WAIT_TIME;

                    this.applyShake = true;

                    // Play quake sound
                    ev.audio.playSample(ev.audio.sounds.quake, 0.50);
                }
            }
        }
    }


    // Animate
    animate(ev) {

        if (!this.active) {

            this.spr.setFrame(5, 0);
        }
        else {

            this.spr.setFrame(5, 
                (this.returning && this.waitTimer <= 0) ? 1 : 2);
        }
    }


    // "Pre-render", i.e render the chain
    preRender(c) {

        const SHAKE_TIME = 60;
        const SHAKE_MAG = 2;

        // Apply shaking (i.e. "quake")
        if (this.applyShake) {

            c.setShake(SHAKE_TIME, SHAKE_MAG);
            this.applyShake = false;
        }

        if (!this.active) return;

        let dy = (((this.pos.y-this.startPoint.y)/16) | 0);

        // Draw the chain
        for (let y = 0; y < dy; ++ y) {

            c.drawBitmapRegion(c.bitmaps.enemy, 
                48, 80, 16, 16,
                (this.pos.x-8) | 0, 
                this.startPoint.y-8 + 16*y);
        }

        // Draw the partial chain
        let h = ((this.pos.y-this.startPoint.y) - dy*16) | 0;
        if (h > 0) {

            c.drawBitmapRegion(c.bitmaps.enemy, 
                48, 80, 16, h,
                (this.pos.x-8) | 0, 
                this.startPoint.y-8 + 16*dy);
        }
        
    }
}
