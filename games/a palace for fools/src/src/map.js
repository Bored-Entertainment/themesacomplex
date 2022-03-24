import { Bitmap } from "./engine/bitmap.js";
import { State } from "./engine/input.js";

//
// Map
//
// (c) 2019 Jani Nykänen


export class GameMap {


    constructor() {

        this.image = document.createElement("canvas");
        this.ctx = this.image.getContext("2d");

        this.refreshed = false;
        this.active = false;

        this.tiles = null;

        this.w = 0;
        this.h = 0;

        this.scale = 1;

        this.bmp = new Bitmap(this.image);

        this.flickerTime = 0.0;
    }


    // Activate
    activate(stage) {

        this.active = true;

        this.w = stage.w;
        this.h = stage.h;

        this.scale = Math.min(
            (128 / this.w) | 0,
            (128 / this.h) | 0
        );

        this.image.width  = this.w * this.scale;
        this.image.height = this.h * this.scale;

        this.refreshed = false;
    }


    // Update
    update(stage, textbox, objm, ev) {

        const FLICKER_SPEED = 0.05;

        let s = ev.input.action.select.state == State.Pressed;
        let p = ev.input.action.start.state == State.Pressed

        if (this.active) {
            
            if (p || s) {

                this.active = false;

                ev.audio.playSample(ev.audio.sounds.pause, 0.50);
            }
            else {

                this.flickerTime  += FLICKER_SPEED * ev.step;
                this.flickerTime %= 2;
            }
            return true;
        }

        if (s) {

            // Check if the player has the required
            // map
            if (objm.checkMap(stage)) {

                this.activate(stage);
                ev.audio.playSample(ev.audio.sounds.pause, 0.50);
                return true;
            }
            else {

                textbox.addMessage(
                    ev.loc.dialogue.general[5]
                );
                textbox.activate();

                ev.audio.playSample(ev.audio.sounds.deny, 0.60);    
            }
            
        }

        return false;
    }


    // Refresh
    refresh(stage, cam) {

        let c = this.ctx;

        c.fillStyle = "rgb(170, 85, 0)";
        c.fillRect(0, 0, 
            this.w*this.scale, this.h*this.scale);

        // Highlight current screen
        let w = (cam.w/16) | 0;
        let h = (cam.h/16) | 0;
        c.fillStyle = "rgb(255, 170, 85)";
        c.fillRect(
            cam.pos.x*w*this.scale,
            cam.pos.y*h*this.scale,
            w*this.scale,
            h*this.scale);

        c.fillStyle = "rgb(0, 0, 0)";
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                if (stage.isSolid(x, y, false)) {

                    c.fillRect(x*this.scale, y*this.scale, 
                        this.scale, this.scale);
                }
            }
        }
    }


    // Draw borders
    drawBorders(c) {

        let b = c.bitmaps.map;

        let w = ((this.w*this.scale / 16) | 0) + 2;
        let h = ((this.h*this.scale / 16) | 0) + 2;

        let dx = (w*16 - this.w*this.scale) / 2;
        let dy = (h*16 - this.h*this.scale) / 2;

        let sx, sy;

        c.move(-dx, -dy);

        // Horizontal
        for (let x = 0; x < w; ++ x) {

            if (x == 0)
                sx = 0;
            else if (x == w-1)
                sx = 32;
            else
                sx = 16;

            // Top
            c.drawBitmapRegion(b,
                sx, 0, 16, 16, x*16, 0);
            // Bottom
            c.drawBitmapRegion(b,
                sx, 32, 16, 16, x*16, (h-1)*16);
        }

        // Vertical
        for (let y = 1; y < h-1; ++ y) {

            sy = 16;

            // Left
            c.drawBitmapRegion(b,
                0, sy, 16, 16, 0, y*16);
            // Right
            c.drawBitmapRegion(b,
                32, sy, 16, 16, (w-1)*16, y*16);
        }

        c.move(dx, dy);
    }


    // Draw
    draw(c, stage, cam, pl) {

        if (!this.active) return;

        if (!this.refreshed) {

            this.refresh(stage, cam);
            this.refreshed = true;
        }

        c.moveTo(c.w/2 - this.w*this.scale/2,
            c.h/2 - this.h*this.scale/2);

        // Draw borders
        this.drawBorders(c);

        // Draw map
        c.setColor(85, 0, 0);
        c.fillRect(-1, -1, this.w*this.scale+2, this.h*this.scale+2);
        c.drawBitmap(this.bmp, 0, 0);

        // Draw flashing player
        let px = (pl.x/16) | 0;
        let py = (pl.y/16) | 0;

        if (this.flickerTime >= 1) {

            c.setColor(170, 0, 0);
            c.fillRect(px*this.scale-1, py*this.scale-1, 
                this.scale+2, this.scale+2);
        }

        c.moveTo(0, 0);

    }
}
