import { State } from "./engine/input.js";
import { negMod, drawBoxWithBorders } from "./engine/util.js";

//
// A generic menu for all of your
// menu-ing needs!
//
// (c) 2019 Jani Nykänen
//

const CHAR_WIDTH = 8;
const HEIGHT_MUL = 12;


export class MenuButton {

    constructor(text, cb) {

        this.text = text;
        this.cb = cb;
    }
}


export class Menu {

    constructor() {

        this.buttons = new Array();
        for (let a of arguments) {

            this.buttons.push(a);
        }

        // Compute dimensions
        this.w = (Math.max(...(this.buttons.map(b => b.text.length))) +1)
            * CHAR_WIDTH;
        this.h = (this.buttons.length) * HEIGHT_MUL;

        this.cpos = 0;
        this.active = false;
    }


    // Activate
    activate(p) {

        if (p != null) this.cpos = p;

        this.active = true;
    }


    // Disable
    disable() {

        this.active = false;
    }


    // Update
    update(ev) {

        if (!this.active || ev.tr.active) return;

        let opos = this.cpos;
        if (ev.input.action.up.state == State.Pressed) {

            -- this.cpos;
        }
        else if (ev.input.action.down.state == State.Pressed) {

            ++ this.cpos;
        }
        this.cpos = negMod(this.cpos, this.buttons.length);

        if (this.cpos != opos) {

            ev.audio.playSample(ev.audio.sounds.next, 0.60);
        }

        let b = this.buttons[this.cpos];
        if (ev.input.action.start.state == State.Pressed ||
            ev.input.action.fire1.state == State.Pressed) {

            if (b.cb != null) {

                b.cb(ev);
            }
            ev.audio.playSample(ev.audio.sounds.accept, 0.60);
        }
    }


    // Draw
    draw(c) {

        const COLORS = [255, 0, 85];
        const OFFSET = 8;

        if (!this.active) return;

        let tx = c.w/2 - this.w/2;
        let ty = c.h/2 - this.h/2 - OFFSET/2;

        drawBoxWithBorders(c, tx, ty, this.w, this.h+OFFSET, COLORS);

        // Draw buttons
        let str;
        for (let i = 0; i < this.buttons.length; ++ i) {

            str = this.cpos == i ? "@" : " ";
            str += this.buttons[i].text;

            c.drawText(c.bitmaps.font, str,
                tx, 
                1 + OFFSET/2 + ty + i*HEIGHT_MUL,
                8-CHAR_WIDTH, HEIGHT_MUL-8, false);
        }
    }

}
