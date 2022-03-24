import { Vector2 } from "./engine/vector.js";
import { updateSpeedAxis } from "./engine/util.js";

//
// A game object. Can take collisions.
//
// (c) 2019 Jani Nykänen
//


export class GameObject {


    constructor(x, y) {

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2(0, 0);
        this.target = new Vector2(0, 0);
        this.acc = new Vector2(1, 1);

        this.w = 16;
        this.h = 16;

        this.canJump = false;
        this.jumpTimer = 0.0;

        this.touchLadder = false;
        this.ladderX = 0;
        this.climbing = false;

        this.touchWater = false;

        this.dying = false;
        this.exist = true;

        this.dieOnCollision = false;
        this.forceUp = false;

        this.hurtTimer = 0;
        this.hitbox = new Vector2(this.w, this.h);

        this.breakWall = 0;
        this.hasKey = false;
        this.ignoreLadder = false;

        this.bounce = false;
        this.bounceFactor = new Vector2(0, 0);

        this.dir = 0;

        this.health = 1;
        this.maxHealth = this.health;
        this.friendly = false;
        this.harmless = false;

        this.inCamera = true;
    }


    // Update movement
    move(ev) {

        const VERTICAL_WATER_MUL = 0.5;
        const HORIZONTAL_WATER_MUL = 0.5;

        let mul = new Vector2(1, 1);
        if (this.touchWater) {
            
            mul.x = HORIZONTAL_WATER_MUL;
            mul.y = VERTICAL_WATER_MUL
        }

        // Store old position
        this.oldPos = this.pos.clone();

        // Update speed axes
        if (this.acc.x > 0) {

            this.speed.x = updateSpeedAxis(this.speed.x, 
                mul.x * this.target.x, mul.x * this.acc.x * ev.step);
        }
        if (this.acc.y > 0) {

            this.speed.y = updateSpeedAxis(this.speed.y, 
                mul.y * this.target.y, mul.y * this.acc.y * ev.step);
        }

        // Update position
        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    // Update game object
    update(ev, extra) {

        if (!this.exist) return;

        if (this.dying) {

            if (this.die)
                this.die(ev, extra);
            return;
        }

        // This is possibly faster than testing
        // if 'control' is a function
        if (this.control != null) {

            this.control(ev, extra);
        }
        if (!this.inCamera) return;

        this.move(ev);

        if (this.animate != null) {

            this.animate(ev);
        }

        this.canJump = false;
        this.touchLadder = false;
        this.touchWater = false;
    }   


    // Ladder collision
    ladderCollision(x, y, w, h) {

        if (!this.exist || this.dying) return;

        let px = this.pos.x;
        let py = this.pos.y;

        let pw = this.w;
        let ph = this.h;

        let touch = 
            px+pw/4 > x &&
            px-pw/4 < x+w &&
            py+ph/4 > y &&
            py-ph/4 < y+h;

        this.touchLadder |= touch;

        if (touch)
            this.ladderX = x;
    }


    // Water collision
    waterCollision(x, y, w, h) {

        if (!this.exist || this.dying) return;

        let px = this.pos.x;
        let py = this.pos.y;

        let pw = this.w;
        let ph = this.h;

        this.touchWater |= 
            px+pw/2 > x &&
            px-pw/2 < x+w &&
            py+ph/2 > y &&
            py-ph/2 < y+h;
    }


    // Hurt collision
    hurtCollision(x, y, w, h, ev, dmg, force) {

        if (!this.hurt || 
            (!force && this.hurtTimer > 0) ||
            !this.exist || 
            this.dying) return false;

        let px = this.pos.x;
        let py = this.pos.y;

        let pw = this.hitbox.x;
        let ph = this.hitbox.y;

        // If in the hurt area... activate
        // pain!
        if (px+pw/2 > x &&
            px-pw/2 < x+w &&
            py+ph/2 > y &&
            py-ph/2 < y+h) {

            if (dmg == null) dmg = 1;

            this.hurt(x+w/2, y+h/2, ev, dmg, force);
            return true;
        }

        return false;
    }


    // Horizontal collision
    // (or wait, maybe vertical?)
    horizontalCollision(x, y, d, dir, ev) {

        const OFFSET = 1;

        if (!this.exist || this.dying) return;

        let px = this.pos.x;
        let py = this.pos.y;
        let opy = this.oldPos.y;

        let w = this.w;
        let h = this.h;

        // If not in the horizontal area,
        // stop here
        if (px+w/2 <= x || px-w/2 >= x+d) 
            return false;

        // Check collision from above
        if ((!dir || dir > 0) &&
            this.speed.y > 0.0 &&
            py+h/2 >= y-(OFFSET+this.speed.y)*ev.step && 
            opy+h/2 < y+(OFFSET+this.speed.y)*ev.step) {

            this.pos.y = y - h/2;
            
            this.canJump = true;
            this.jumpTimer = 0;

            if (this.dieOnCollision) {

                this.pos.y = y;
                if (this.kill != null)
                    this.kill(ev);
            }

            // Bounce
            if (this.bounce) {

                this.speed.y *= -this.bounceFactor.y;
            }
            else {

                this.speed.y = 0;
            }

            return true;

        }

        // Check collision from below
        if ((!dir || dir < 0) &&
            this.speed.y < 0.0 &&
            py-h/2 <= y+(OFFSET-this.speed.y)*ev.step && 
            opy-h/2 > y+(-OFFSET+this.speed.y)*ev.step) {

            this.pos.y = y + h/2;

            if (this.onCeilingHit) {

                this.onCeilingHit(ev);
            }    

            if (this.forceUp)
                this.speed.y *= -1;

            else {

                // Bounce
                if (this.bounce) {

                    this.speed.y *= -this.bounceFactor.y;
                }
                else {

                    this.speed.y = 0;
                }
            }

            this.jumpTimer = 0.0;

            if (this.dieOnCollision) {

                this.pos.y = y;
                if (this.kill != null)
                    this.kill(ev);
            } 

            return true;
        }

        return false;
    }


    // Vertical collision
    // TODO: One could merge this one and the previous
    // one to a more general method. The code is 99%
    // the same.
    verticalCollision(x, y, d, dir, ev) {

        const OFFSET = 1;

        if (!this.exist || this.dying) return;

        let margin = this.dieOnCollision ? 0 : 1;

        let px = this.pos.x;
        let py = this.pos.y;
        let opx = this.oldPos.x;

        let w = this.w;
        let h = this.h;

        // If not in the vertical area,
        // stop here
        if (py+h/2 <= y+margin || py-h/2 >= y+d) 
            return false;

        // Check collision from left
        if ((!dir || dir < 0) &&
            this.speed.x > 0.0 &&
            px+w/2 >= x-(OFFSET+this.speed.x)*ev.step && 
            opx+w/2 < x+(OFFSET+this.speed.x)*ev.step) {

            this.pos.x = x - w/2;

            if (this.dieOnCollision) {

                this.pos.x = x;
                if (this.kill != null)
                    this.kill(ev);
            }

            if (this.bounce) {

                this.speed.x *= -this.bounceFactor.x;
                this.dir = -1;
            }
            else {

                this.speed.x = 0;
            }

            return true;
        }

        // Check collision from right
        if ((!dir || dir > 0) &&
            this.speed.x < 0.0 &&
            px-w/2 <= x+( OFFSET-this.speed.x)*ev.step && 
            opx-w/2 > x+(-OFFSET+this.speed.x)*ev.step) {

            this.pos.x = x + w/2;

            if (this.dieOnCollision) {

                this.pos.x = x;
                if (this.kill != null)
                    this.kill(ev);
            }

            // Bounce
            if (this.bounce) {

                this.speed.x *= -this.bounceFactor.x;
                this.dir = 1;
            }
            else {

                this.speed.x = 0;
            }

            return true;
        }

        return false;
    }


    // Bullet collision (note, bullet is also
    // a game object...)
    bulletCollision(b, ev) {

        if (!b.exist || b.dying || 
            !this.exist || this.dying ||
            this.harmless ||
            b.friendly == this.friendly)
            return;

        let px = this.pos.x;
        let py = this.pos.y;
        let pw = this.w/2;
        let ph = this.h/2;

        let bx = b.pos.x;
        let by = b.pos.y;
        let bw = b.w/2;
        let bh = b.h/2;

        let col = 
            px+pw >= bx-bw &&
            px-pw <= bx+bw &&
            py+ph >= by-bh &&
            py-ph <= by+bh;

        if (col) {

            b.kill(ev, this.health <= 0 && !this.friendly);

            if (this.bulletEvent != null) {

                this.bulletEvent(b, ev);
            }
        }
    }

}
