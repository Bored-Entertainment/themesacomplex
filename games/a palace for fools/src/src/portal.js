import { Sprite } from "./engine/sprite.js";
import { Vector2, Vector3 } from "./engine/vector.js";
import { State } from "./engine/input.js";
import { RenderedObject } from "./renderedobject.js";

//
// A time-traveling portal
//
// (c) 2019 Jani Nykänen
//


export class Portal extends RenderedObject {


    constructor(x, y, id, cb, stage, pl, textbox) {

        super(x, y);

        // Collision dimensions
        this.w = 4;
        this.h = 32;

        if (id == null)
            id = 0;

        this.spr = new Sprite(24, 32);
        this.spr.setFrame(id, 0);
        this.id = id;

        this.active = (this.id == 2 && pl.hasGem) ||
            (this.id < 2 && stage.leverPressed);
        this.cb = cb;

        this.inCamera = false;

        this.textbox = textbox;
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 8;

        if (!this.active) {

            this.spr.setFrame(this.id, 0);
        }
        else {

            this.spr.animate(this.id, 
                1, 3, ANIM_SPEED, ev.step);
        }
    }


    // Update
    update(pl, ev, stage) {
        
        if (!this.inCamera) return;

        this.animate(ev);
        this.active = (this.id == 2 && pl.hasGem) ||
            (this.id < 2 && stage.leverPressed);
    }


    // Camera movement animation
    cameraMoveAnimation(ev) {

        this.animate(ev);
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        let px = (this.pos.x - this.spr.w/2) | 0;
        let py = (this.pos.y - this.spr.h/2) | 0;
        
        c.drawSprite(this.spr, c.bitmaps.door, px, py);

        c.move(-tx, -ty);
    }


    // Teleport
    teleport(pl, stage, ev) {

        const COLOR = [[170, 170, 0], 
            [85, 170, 255], 
            [255, 255, 255]];

        // Play sound
        ev.audio.playSample(ev.audio.sounds.teleport,
            0.50);

        // Set player position
        pl.pos.x = this.pos.x;
        pl.checkpoint = pl.pos.clone();

        // Set player pose
        pl.setPortalPose(true);

        // Call callback function, if any
        if (this.cb != null) {

            this.cb(ev, pl, COLOR[this.id], this.id);
        }
    }


    // Activate
    activate(pl, stage, ev) {

        pl.showArrow = false;

        if (this.id == 2) {

            ev.audio.playSample(
                ev.audio.sounds.accept, 
                0.60);

            this.textbox.addMessage(
                ...ev.loc.dialogue["enter_final"]
            );
            this.textbox.activate((ev, state) => {
                
                if (state)
                    this.teleport(pl, stage, ev);
            });
        }
        else {

            this.teleport(pl, stage, ev);
        }
    }

}
