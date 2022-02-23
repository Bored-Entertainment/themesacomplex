import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";

//
// "Created by" sequence
//
// (c) 2019 Jani Nykänen
//


const FADE_TIME = 30;


export class CreatedByIntro {

    constructor() {

        this.phase = 0;
        this.timer = 0;
        this.waitTimer = 0;
        this.fadeIn = true;
    }


    // Initialize
    init(ev) {

        // ...
    }


    // Update
    update(ev) {

        const WAIT_TIME = 120;

        if (ev.tr.active) return;
        
        if (this.waitTimer > 0) {

            if (ev.input.actionOccurred()) {

                this.waitTimer = 0;
            }

            this.waitTimer -= ev.step;
            return;
        }

        if (this.timer > 0) {

            this.timer -= ev.step;
            
            if (this.timer <= 0) {

                this.timer = 0;
                if (!this.fadeIn && this.phase == 1) {

                    ev.changeScene("title");
                    ev.tr.activate(false, TransitionMode.Empty, 2.0);
                } 
                else {

                    if (this.fadeIn) {

                        this.waitTimer = WAIT_TIME;
                    }
                    else {

                        ++ this.phase;
                    }
                    this.timer = FADE_TIME;
                    this.fadeIn = !this.fadeIn;
                }
            }
        }
    }


    // Draw 
    draw(c) {

        c.clear(0);

        let row = 3;
        let t;
        if (this.waitTimer <= 0) {

            t = this.timer / FADE_TIME;
            if (this.fadeIn)
                t = 1.0 - t;

            row = Math.min(3, (t * 4) | 0);
        }

        let w = 80;
        let h = this.phase == 0 ? 80 : 32;

        let x = c.w/2 - w/2;
        let y = c.h/2 - h/2;
        
        c.drawBitmapRegion(c.bitmaps.creator,
            this.phase*80, row*h, w, h,
            x, y);
    }


    // On change
    onChange(ev) {

        ev.tr.active = false;

        this.phase = 0;
        this.timer = FADE_TIME;
        this.waitTimer = 0;
    }
}
