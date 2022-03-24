import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";

//
// Ending sequence
//
// (c) 2019 Jani Nykänen
//


const FADE_TIME = 120;


export class Ending {

    constructor() {

        this.phase = 0;
        this.timer = 0;
    }


    // Initialize
    init(ev) {

        this.textbox = new Textbox(ev);
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.textbox.update(ev);

        if (!this.textbox.active && 
            this.phase == 0) {

            ++ this.phase;
        }

        // Fade in "The End" text
        if (this.phase == 1) {

            if (this.timer > 0) {

                this.timer -= ev.step;
                if (this.timer < 0)
                    this.timer = 0;
            }
        }
    }


    // Draw 
    draw(c) {

        c.clear(0);

        // Draw "The End"
        let row = ( (1.0 - (this.timer/FADE_TIME)) * 4) | 0;
        row = Math.min(3, row);
        c.drawBitmapRegion(c.bitmaps.ending,
            0, row*32, 80, 32,
            c.w/2 - 40, c.h/2-16);
        
        // Draw textbox
        this.textbox.draw(c, true);
    
        
    }


    // On change
    onChange(ev) {

        ev.tr.active = false;

        this.textbox.addMessage(
            ...ev.loc.dialogue.ending
        );
    
        this.textbox.activate();
        this.textbox.doNotResumeMusic();

        this.phase = 0;
        this.timer = FADE_TIME;
    }
}
