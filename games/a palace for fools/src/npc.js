import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";

//
// It's an NPC, alright. A guy
// the player can talk with.
//
// (c) 2019 Jani Nykänen
//


export class NPC extends RenderedObject {

    
    constructor(x, y, id, textbox) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        this.flip = Flip.None;

        this.inCamera = false;
    
        this.textbox = textbox;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        const ANIM_SPEED = 16;

        // Determine sprite flip
        this.flip = pl.pos.x < this.pos.x ? Flip.None :
            Flip.Horizontal;

        // Animate
        this.spr.animate(0, 0, 1, ANIM_SPEED, ev.step);
    }


    // Activate
    activate(pl, stage, ev) {

        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.60);

        this.textbox.addMessage(
            ...ev.loc.dialogue["npc" + String(this.id+1)]
        );
        this.textbox.activate();
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-7) | 0,
            this.flip);

        c.move(-tx, -ty);
    }

}
