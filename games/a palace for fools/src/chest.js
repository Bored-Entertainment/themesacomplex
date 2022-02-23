import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";
import { Vector2 } from "./engine/vector.js";

//
// A chest that contains an item
//
// (c) 2019 Jani Nykänen
//

export const PURPLE_BOX_START = 32;


export class Chest extends RenderedObject {

    
    constructor(x, y, id, textbox, pl, shardCount) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        if (id <= -1)
            this.spr.setFrame(2, 0);
        else if(id >= PURPLE_BOX_START)
            this.spr.setFrame(1, 2);
        else
            this.spr.setFrame(1, 0);
            
        this.flip = (((x/16)|0) % 2 == 0 && this.id >= 0)
            ? Flip.Horizontal : Flip.None;

        this.inCamera = false;
    
        this.textbox = textbox;

        this.active = true;
        if (pl != null) {

            if (this.id >= 0 && this.id < PURPLE_BOX_START)
                this.active = !pl.items[this.id];

            else if (this.id >= PURPLE_BOX_START)
                this.active = !pl.purpleBoxes[this.id - PURPLE_BOX_START];

            else
                this.active = !pl.hcontainers[-this.id -1];
        }

        if (!this.active)
            ++ this.spr.frame;

        this.shardCount = shardCount;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        // ...
    }


    // Item effect
    itemEffect(pl, ev) {

        if (this.id <= -1) {

            ++ pl.health;
            ++ pl.maxHealth;

            pl.hcontainers[-this.id - 1] = true;
        }
        else if (this.id >= PURPLE_BOX_START){
            
            pl.purpleBoxes[this.id - PURPLE_BOX_START] = true;
        }
        else {

            pl.items[this.id] = true;
        }
    }


    // Activate
    activate(pl, stage, ev) {

        const WAIT_TIME = 90;
        const ITEM_WAIT = 30;
        const ITEM_SPEED = -0.5;

        let t = Math.min(PURPLE_BOX_START, Math.max(-1, this.id)+1);

        let itemID = "item" + String(t);
        if (this.id >= PURPLE_BOX_START &&
            pl.crystalCount >= this.shardCount-1) {

            itemID += "_op";
        }

        this.textbox.addMessage(
            ...ev.loc.dialogue[itemID]
        );
        if (this.id >= PURPLE_BOX_START) {

            if (pl.crystalCount < this.shardCount-1) {

                this.textbox.setDParamValue(
                    this.shardCount - (pl.crystalCount+1)
                );
            }
            ++ pl.crystalCount;
        }

        this.textbox.activate(WAIT_TIME, 
            t, 
            new Vector2(this.pos.x, this.pos.y-8), 
            ITEM_SPEED, ITEM_WAIT);

        ++ this.spr.frame;

        if (this.id >= 0) {

            // Make the player crouch near the chest
            pl.pos.x = this.pos.x + 8*(this.flip == Flip.None ? -1 : 1);
            pl.pos.y = this.pos.y + 2;
            pl.spr.setFrame(3, 2);
            pl.flip = this.flip;
        }
        else {

            // Set player frame
            pl.spr.setFrame(4, 3);
        }

        pl.showArrow = false;
        pl.stopMovement();

        // Play sound
        ev.audio.playSample(
            this.id == -1 ? ev.audio.sounds.healthUp : 
                ev.audio.sounds.item, 
            0.50);

        // Apply item effect
        this.itemEffect(pl, ev);

        this.active = false;

        // Set player checkpoint
        pl.checkpoint = this.pos.clone();
        pl.checkpoint.y += 2;
        pl.checkID = null;
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        c.move(-tx, -ty);
    }

}
