import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { clamp } from "./engine/util.js";

//
// The final boss.
//
// (c) 2019 Jani Nykänen
//

const APPEAR_TIME = 60;
const OPEN_TIME = 30;
const OPEN_PLUS = 30;


export class Eye extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 40;
        this.h = 48;

        this.hitArea = new Vector2(32, 32);

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.maxHealth = 40;
        this.health = this.maxHealth;

        this.spr = new Sprite(48, 48);
        this.spr.setFrame(1, 3);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.ignoreLadder = true;
        this.preventLeaving = true;

        this.appearTimer = APPEAR_TIME;
        this.waitTime = 0;
        this.fadingIn = false;

        this.extraWait = 0;
        this.mode = 0;
        this.stompCount = 0;
        this.applyShake = false;
        this.power = 3;
        this.deathSpeedMod = 0.25;

        this.barPos = 1.0;

        this.top = Math.floor(y/144)*144;

        this.center = new Vector2(0, 0);

        this.dropItem = false;

        this.lastAttack = 0;
    }


    // Reset
    reset() {

        this.appearTimer = APPEAR_TIME;
    }


    // Compute mode
    computeMode() {

        const PROB = [
            [0.5, 0.20, 0.10, 0],
            [0.4, 0.30, 0.20, 0.10],
            [0.30, 0.30, 0.20, 0.20],
            [0.25, 0.25, 0.25, 0.25],
        ];

        let t = ( (1.0 - (this.health / this.maxHealth)) * 4) | 0;
        let p = Math.random();

        let sum = 0;
        let q;
        for (let i = 0; i < 4; ++ i) {

            q = (PROB[t]) [i];
            sum += q;

            if (p <= sum) {

                return i;
            }
        }
        return 3; // Should not happen
    }


    // Re-appear
    reappear() {
        
        const MAX_Y = 144-16;

        let x = this.spr.w/2 + ((Math.random() * (160 - this.spr.w)) | 0);
        let y = this.top + 
            this.spr.h/2 + ((Math.random() * (MAX_Y - this.spr.h)) | 0);

        this.pos.x = x;
        this.pos.y = y;

        this.mode = this.computeMode();
        // This actually makes possible to use 
        // "impossible" attack in the first phase,
        // but it is not very likely
        if (this.mode == this.lastAttack) {

            this.mode = (this.mode +1) % 4;
        }
        this.lastAttack = this.mode;
        this.isStatic = false;

        switch(this.mode) {

        case 0:
            this.spr.row = 1;
            break;

        case 1:
            this.isStatic = true;
            this.spr.row = 3;
            break;

        case 2:

            this.isStatic = true;
            this.pos.y = this.top;
            this.spr.row = 1;
            this.stompCount = 0;
            break;

        case 3:

            this.isStatic = true;
            this.pos.y =  this.top;
            this.spr.row = 3;
            break;

        default:
            break;
        }
    }


    // "Ram"
    ram(pl) {

        const WAIT_TIME = 45;

        const FLY_SPEED_MIN = 1.0;
        const FLY_SPEED_VARY = 1.0;
        const SPEED_MOD = 1.25;

        let angle = Math.atan2(
            this.pos.y-pl.pos.y,
            this.pos.x-pl.pos.x);

        let s = FLY_SPEED_MIN + Math.random() * FLY_SPEED_VARY;
        s *= 1.0 + (SPEED_MOD-1.0) * (1.0 - this.health/this.maxHealth);

        this.speed.x = -Math.cos(angle) * s;
        this.speed.y = -Math.sin(angle) * s;

        this.waitTime = WAIT_TIME * s;
    }


    // Create bullets
    createBullets(bgen, angleStart, bcount, bspeed, stop, ev) {

         // Create bullets
         let b, angle;
         for (let i = 0; i < bcount; ++ i) {
 
             angle = angleStart + i * (Math.PI*2 / bcount);
 
             b = bgen.createElement(
                 this.pos.x, 
                 this.pos.y, 
                 -Math.cos(angle) * bspeed, 
                 -Math.sin(angle) * bspeed, 3);
             if (b != null) {
 
                 // This way we prevent bullets
                 // going through walls
                 b.oldPos.x = this.pos.x;
                 b.oldPos.y = this.pos.y;
             }

             if (stop != null && i >= stop) break;
         }
         ev.audio.playSample(ev.audio.sounds.shootBig, 0.50);
    }


    // Open eye
    openEye(bgen, ev) {

        const BULLET_COUNT_START = 4;
        const BULLET_SPEED = 1.5;

        this.waitTime = OPEN_TIME + OPEN_PLUS;

        let angleStart = ((Math.random()*2) | 0 ) * (Math.PI/4.0);

        let bcount = BULLET_COUNT_START;
        if (this.health <= this.maxHealth/2) {

            angleStart = 0;
            bcount *= 2;
        }

        // Create bullets
        this.createBullets(bgen, angleStart,
            bcount, BULLET_SPEED, null, ev);
    }


    // Special stomp
    stompSpecial(bgen, ev) {

        const GRAVITY_MAX = 6.0;
        const GRAVITY = 0.35;
        const WAIT_TIME = 60;
    
        this.target.x = 0;
        this.target.y = GRAVITY_MAX;

        this.acc.y = GRAVITY;
        this.bounce = false;

        if (!this.canJump) {

            this.waitTime = 1;
        }

        if (this.spr.row != 0 && this.canJump) {

            this.spr.row = 0;
            this.waitTime = WAIT_TIME;

            ev.audio.playSample(ev.audio.sounds.quake, 0.50);
                this.applyShake = true;

            // Create bullets
            this.createBullets(bgen, 0, 8, 2, 4, ev);
        }
    }


    // Stomp
    stomp(pl, ev) {

        const SPEED_X = 0.75;
        const GRAVITY_MAX = 4.0;
        const GRAVITY = 0.2;
        const STOMP_MAX = 3;

        this.waitTime = 1;

        this.target.x = SPEED_X * 
            (pl.pos.x < this.pos.x ? -1 : 1);
        this.target.y = GRAVITY_MAX; 

        this.acc.x = 0.025;
        this.acc.y = GRAVITY;

        let t = 1.0 - this.health / this.maxHealth;
        let stomps = 1 + ((t * STOMP_MAX) | 0)

        if (this.canJump && !this.oldCanJump) {

            if (this.appearTimer <= 0) {

                ev.audio.playSample(ev.audio.sounds.quake, 0.50);
                this.applyShake = true;
            }

            ++ this.stompCount;
        }

        if (this.stompCount >= stomps &&
            this.speed.y > 0) {

            this.waitTime = 0;
        }
    }
    

    // Called when the eye dies
    deathEvent(objm, ev) {

        objm.addLever(
            4.5, ((this.pos.y/144)|0) * 144 / 16 + 7, null
        );

        ev.audio.stopMusic();
    }


    // Update AI
    updateAI(pl, ev, bgen, objm) {

        const EXTRA_WAIT_MIN = 30;
        const EXTRA_WAIT_VARY = 30;
        const BAR_SPEED = 0.005;

        // Set default target speeds
        // and acceleration 
        this.target.x = 0;
        this.target.y = 0;

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.bounce = true;

        // STOMP!
        if (this.appearTimer <= 0) {

            if (this.mode == 2)
                this.stomp(pl, ev);

            else if (this.mode == 3)
                this.stompSpecial(bgen, ev);
        }

        // Update health bar position
        let t = this.health/this.maxHealth;
        if (t < this.barPos) {

            this.barPos -= BAR_SPEED * ev.step;
            this.barPos = Math.max(t, this.barPos);
        }

        this.harmless = this.appearTimer > 0;

        // Appear
        if (this.appearTimer > 0) {

            if (!this.fadingIn) {

                this.speed.x = 0;
                this.speed.y = 0;
            }

            this.appearTimer -= ev.step;
            
            if (this.appearTimer <= 0.0) {

                if (this.fadingIn) {

                    this.extraWait = 0.0;
                    this.appearTimer += APPEAR_TIME;
                    this.fadingIn = false;

                    // Jump to new position
                    this.reappear();
                }
                else {

                    if (this.mode == 0)
                        this.ram(pl);
                    
                    else if (this.mode == 1)
                        this.openEye(bgen, ev);
                }
            }

            return;
        }

        // Update wait time
        if (this.mode < 2 || (this.mode == 3 && this.canJump)) {

            this.waitTime -= ev.step;
        }

        // Disappear, if the time is full
        if (this.waitTime <= 0) {

            this.extraWait = EXTRA_WAIT_MIN
                + ((Math.random() * EXTRA_WAIT_VARY) | 0);

            this.extraWait *= (this.health / this.maxHealth);
            this.extraWait |= 0;

            this.appearTimer = APPEAR_TIME + this.extraWait;
            this.fadingIn = true;
        }
    }


    // Animate fading
    fade() {

        let t = (this.appearTimer-this.extraWait) / APPEAR_TIME;
        t = clamp(t, 0, 1);
        if (this.fadingIn)
            t = 1.0 - t;

        let frame = Math.min((t * 4) | 0, 3);

        this.spr.setFrame(this.spr.row, frame);
    }


    // Animate opening eye
    animateEye() {

        let t = Math.max(0, this.waitTime-OPEN_PLUS) / OPEN_TIME;
        let row = ((t * 3) | 0);

        this.spr.row = row;
    }


    // Animate
    animate(ev) {

        if (this.appearTimer > 0) {

            this.fade();
        }
        else {

            // Animate opening eye
            if (this.mode == 1) {

                this.animateEye();
            }
        }
    }


    // Draw health bar
    drawHealthBar(c) {

        const WIDTH = 80;
        const HEIGHT = 6;
        const OFF = 3;
        const GRADIENT_OFF = 1;

        const COLORS = [
            [170, 0, 0],
            [255, 85, 0],
            [255, 255, 255]
        ];

        let tx = 160/2 - WIDTH/2;
        let ty = 144 - HEIGHT - OFF;

        c.setColor(0, 0, 0);
        c.fillRect(tx-1, ty-1,
            WIDTH+2, HEIGHT+2
        );

        let t = this.barPos;
        let p = (t * WIDTH) | 0;

        c.setColor(85);
        c.fillRect(tx, ty,
            WIDTH, HEIGHT
        );

        let off = ((HEIGHT/COLORS.length)/2) | 0;
        for (let i = 0; i < COLORS.length; ++ i) {

            c.setColor(...COLORS[i]);
            c.fillRect(tx, ty+off*i,
                p, HEIGHT-off*i*2 - GRADIENT_OFF*Math.min(1, i)
            );
        }

        if (this.health < this.maxHealth) {

            c.setColor(0);
            c.fillRect(tx + p, ty, 1, HEIGHT);
        }
    }


    // Draw the dying animation
    drawDeath(c, t) {

        const SCALE = 6;
        const WIDTH_MUL = 3;

        let amplitude = t * this.spr.w * WIDTH_MUL;
        let jump = Math.PI *2 / this.spr.h;
        let start = Math.PI * 2 * t;

        let r = (this.spr.h * (1.0 + t*(SCALE-1)) / 2) | 0;

        let px = this.pos.x | 0;
        let py = this.pos.y | 0;

        let step = (r*2) / this.spr.h;
        let sy = 0;
        for (let y = py - r; y < py + r; y += step) {

            c.drawBitmapRegion(c.bitmaps.eye, 
                0, sy, 
                this.spr.w, 1,
                px - this.spr.w/2 + 
                    (Math.sin(start + jump * sy)*amplitude) | 0, 
                y);
            ++ sy;
            sy %= this.spr.h;
        }
    }


    // Draw to the translated position
    // (overriden)
    drawTranslated(c, tx, ty) {

        const SHAKE_TIME = 60;
        const SHAKE_MAG = 2;

        if (this.applyShake &&
            tx == 0 && ty == 0) {

            c.setShake(SHAKE_TIME, SHAKE_MAG);
            this.applyShake = false;
        }

        c.move(tx, ty);

        if (this.dying) {

            this.drawDeath(c, this.deathTimer);
        }
        else {

            c.drawSprite(this.spr, c.bitmaps.eye,
                (this.pos.x-24 + this.center.x) | 0,
                (this.pos.y-24 + this.center.y) | 0,
                this.flip);
        }

        c.move(-tx, -ty);
    }


    // Draw after everything else
    postDraw(c) {

        this.drawHealthBar(c);
    }
}
