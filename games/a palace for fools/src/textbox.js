import { State } from "./engine/input.js";
import { Vector2 } from "./engine/vector.js";
import { drawBoxWithBorders } from "./engine/util.js";

//
// A textbox
//
// (c) 2019 Jani Nykänen
//


export class Textbox {


    constructor(ev) {

        this.queue = new Array();
        this.sizes = new Array();

        this.char = 0;
        this.charTimer = 0;
        this.charPos = 0;
        this.active = false;

        this.endSymbolFloat = 0.0;

        this.waitTimer = 0;
        this.itemWait = 0;
        this.itemPos = new Vector2();
        this.item = null;
        this.itemSpeed = 0;

        this.accept = false;
        this.acceptCB = null;

        this.cursorPos = 0;

        this.yes = ev.loc.dialogue.general[1].replace("\n", "");
        this.no = ev.loc.dialogue.general[2].replace("\n", "");

        this.shakeApplied = false;

        this.musicStopped = false;
        this.musicResumed = false;

        this.endCB = null;
    }


    // Reset
    reset() {

        this.musicStopped = false;
        this.musicResumed = false;
    }


    // Compute size for a textbox
    computeSize(msg) {

        const WIDTH_MUL = 8;
        const HEIGHT_MUL = 10;

        let r = new Vector2();

        let lines = msg.split('\n');

        r.x = Math.max(...(lines.map(lines => lines.length))) * WIDTH_MUL;
        r.y = lines.length * HEIGHT_MUL;

        return r;
    }


    // Add messages
    addMessage() {

        let str;
        for (let a of arguments) {

            // Remove the newline in the end
            if (a.charCodeAt(a.length-1) == "\n".charCodeAt(0)) {

                str = a.substr(0, a.length-1);
            }
            else {

                str = a;
            }

            this.queue.push(str);
            this.sizes.push(this.computeSize(str));
        }
    }


    // Set the value of %d
    setDParamValue(d) {

        let str = String(d);
        for (let i = 0; i < this.queue.length; ++ i) {

            this.queue[i] = this.queue[i].replace("%d", str);
        }
    }

    // Do not resume music after
    // disable
    doNotResumeMusic() {

        this.musicStopped = true;
        this.musicResumed = true;
    }

    
    // Activate
    activate(wait, item, itemPos, speedY, itemWait, acceptCB) {

        this.active = true;
        this.charTimer = 0;
        this.charPos = 0;
        this.queuePos = 0;

        this.accept = false;
        if (acceptCB != null || 
            (wait != null && item == null)) {

            this.accept = true;
            this.acceptCB = item == null ? wait : acceptCB;

            this.cursorPos = 1;
        }

        if (wait == null)
            wait = 0.0;
        this.waitTimer = wait;

        this.item = item;
        if (item != null) {

            if (itemPos != null)
                this.itemPos = itemPos.clone();
            this.itemSpeed = speedY;
            this.itemWait = itemWait;

            if (item <= -1) {

                this.shakeApplied = true;
            }
            
        }
        this.musicStopped = false;
    }


    // Update
    update(ev) {

        const FLOAT_SPEED = 0.1;
        const CHAR_WAIT = 2;

        if (ev.tr.active) return;

        if (!this.active) {

            if (!this.musicResumed) {

                ev.audio.resumeMusic();
                this.musicResumed = true;
            }
            return;
        }

        if (!this.musicStopped) {

            ev.audio.pauseMusic();
            this.musicStopped = true;
            this.musicResumed = false;
        }

        // Update wait timer
        if (this.waitTimer > 0) {

            // Compute item pos
            if (this.item != null) {

                if (this.itemWait > 0) {

                    this.itemPos.y += this.itemSpeed * ev.step;
                    this.itemWait -= 1.0 * ev.step;
                }
            }

            this.waitTimer -= 1.0 * ev.step;
            if (this.waitTimer <= 0.0 && this.endCB != null) {

                this.endCB(ev);
                this.endCB = null;
            }

            return;
        }

        let action = ev.input.actionOccurred();
            //ev.input.action.start.state == State.Pressed ||
            //ev.input.action.fire1.state == State.Pressed;
        let c;

        // Update character timer
        if (this.charPos < this.queue[0].length) {

            if (action) {

                this.charPos = this.queue[0].length;
            }
            else {

                if ((this.charTimer += 1.0 * ev.step) >= CHAR_WAIT) {

                    this.charTimer -= CHAR_WAIT;
                    ++ this.charPos;

                    c = this.queue[0].charCodeAt(this.charPos);
                    if (this.charPos < this.queue[0].length && 
                        c == '\n') {

                        ++ this.charPos;
                    }
                }
            }
        }
        else {

            if (this.queue.length == 1 && this.accept) {

                // Update cursor position
                if (ev.input.action.up.state == State.Pressed ||
                    ev.input.action.down.state == State.Pressed) {
        
                    this.cursorPos = (this.cursorPos +1) % 2;

                    ev.audio.playSample(ev.audio.sounds.next, 0.60);
                }

                // Check if enter or "similar key" pressed
                if (ev.input.action.start.state == State.Pressed ||
                    ev.input.action.fire1.state == State.Pressed) {

                    ev.audio.playSample(
                        this.cursorPos == 0 ? 
                            ev.audio.sounds.accept : 
                            ev.audio.sounds.deny, 
                            0.60);

                    this.queue.shift();
                    this.sizes.shift();

                    this.active = false;

                    if (this.acceptCB != null) {

                        this.acceptCB(ev, this.cursorPos == 0);
                    }
                }
            }
            else {

                // Wait for input
                if (action) {

                    this.queue.shift();
                    this.sizes.shift();

                    this.charPos = 0;
                    this.charTimer = 0;

                    ev.audio.playSample(ev.audio.sounds.next, 0.60);

                    if (this.queue.length == 0) {

                        this.active = false;
                    }
                }

                // Update end symbol floating
                this.endSymbolFloat = 
                    (this.endSymbolFloat + FLOAT_SPEED*ev.step) % 
                    (Math.PI*2);
            }
        }
    }


    // Draw item
    drawItem(c) {

        if (!this.active ||
            this.item == null ||
            this.item < 0) return;

        let sx = (this.item|0 )% 16;
        let sy = (this.item/16) | 0;

        c.drawBitmapRegion(c.bitmaps.items,
            sx*16, sy*16, 16, 16,
            (this.itemPos.x - 8) | 0,
            (this.itemPos.y - 8) | 0);
    }


    // Draw
    draw(c, disableBorders) {

        const CORNER_OFF = 2;
        const TEXT_OFF_X = 0;
        const TEXT_OFF_Y = 2;
        const COLORS = [255, 0, 85];
        const END_FLOAT = 1.1;

        const CONFIRM_W = 32;
        const CONFIRM_H = 24;
        const CONFIRM_OFF = 0;

        if (!this.active ||
            this.waitTimer > 0) return;

        let confirm = this.accept &&
            this.queue.length == 1;

        let w = this.sizes[0].x + CORNER_OFF*2;
        let h = this.sizes[0].y + CORNER_OFF*2;

        let tx = c.w/2 - w/2;
        let ty = c.h/2 - h/2;

        if (confirm) {

            ty -= CONFIRM_H / 2;
        }

        if (!disableBorders)
            drawBoxWithBorders(c, tx, ty, w, h, COLORS);

        // Draw current message
        c.drawText(c.bitmaps.font, 
            this.queue[0].substr(0, this.charPos),
            tx + CORNER_OFF, ty + CORNER_OFF,
            TEXT_OFF_X, TEXT_OFF_Y);

        // Draw finish symbol
        let x, y;
        let str;
        if (this.charPos == this.queue[0].length) {

            if (confirm) {

                str = ["@%1\n %2", " %1\n@%2"][this.cursorPos];
                str = str.replace("%1", this.yes);
                str = str.replace("%2", this.no);

                x = tx+w - CONFIRM_W;
                y = ty+h + CONFIRM_OFF;

                drawBoxWithBorders(c, x, y, CONFIRM_W, CONFIRM_H, COLORS);

                c.drawText(c.bitmaps.font, str, x +1, y + 2, 0, 4, false);
            }
            else {

                y = Math.floor(Math.sin(this.endSymbolFloat) * END_FLOAT) | 0;
                c.drawBitmapRegion(
                    c.bitmaps.font, 
                    24, 0, 8, 8,
                    tx + w - 8, 
                    ty + h - 2 + y);
            }


        }

    }


    // Apply shake (if the item is -1)
    applyShake(c) {

        if (this.shakeApplied) {

            c.setShake(this.waitTimer, (-this.item) | 0);
            this.shakeApplied = false;
        }
    }


    // Disable
    disable() {

        this.active = false;
    }


    // Set ending callback
    setEndCallback(cb) {

        this.endCB = cb;
    }

}
