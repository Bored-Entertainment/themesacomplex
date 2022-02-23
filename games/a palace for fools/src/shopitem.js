import { Sprite } from "./engine/sprite.js";
import { RenderedObject } from "./renderedobject.js";
import { Vector2 } from "./engine/vector.js";

//
// An item in a shop
//
// (c) 2019 Jani Nykänen
//


// Prices
const PRICES = [
    15,
    10,
    10,
    15,

    20,
    25,
    15,
    10,
];


export class ShopItem extends RenderedObject {

    
    constructor(x, y, id, textbox, pl, shardCount) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(3, id);

        this.inCamera = false;

        this.textbox = textbox;

        this.exist = !pl.items[16 + this.id];

        this.shardCount = shardCount;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        this.exist = !pl.items[16 + this.id];
    }


    // Item effect
    itemEffect(pl, ev) {

        if (this.id == 0) {

            ++ pl.health;
            ++ pl.maxHealth;
        }
        else if (this.id == 6) {

            ++ pl.crystalCount;
        }
        pl.items[16 + this.id] = true;
    }


    // Buy
    buy(pl, ev) {

        const WAIT_TIME = 90;
        const ITEM_WAIT = 30;
        const ITEM_SPEED = -0.5;

        let id = this.id+15;
        if (this.id == 0)
            id = 0;
        else if (this.id == 6)
            id = 32;

        let itemID = "item" + String(id);
        if (this.id == 6 &&
            pl.crystalCount >= this.shardCount-1) {

            itemID += "_op";
        }

        this.textbox.addMessage(
            ...ev.loc.dialogue[itemID]
        );
        if (this.id == 6) {

            this.textbox.setDParamValue(
                this.shardCount - (pl.crystalCount+1)
            );
        }

        this.textbox.activate(WAIT_TIME, 16+this.id, 
            new Vector2(this.pos.x, this.pos.y-8), 
            ITEM_SPEED, ITEM_WAIT);

        this.exist = false;

        pl.showArrow = false;
        pl.stopMovement();
        // Set player frame
        pl.spr.setFrame(4, 3);

        ev.audio.playSample(
            this.id == 0 ? ev.audio.sounds.healthUp : 
                ev.audio.sounds.item, 
            0.50);

        // Apply item effect
        this.itemEffect(pl, ev);

        pl.gems -= PRICES[this.id];
    }


    // Activate
    activate(pl, stage, ev) {

        if (pl.gems < PRICES[this.id]) {

            ev.audio.playSample(
                ev.audio.sounds.deny, 
                0.60);

            this.textbox.addMessage(
                ev.loc.dialogue.shop[0]
            );
            this.textbox.activate();
            return;
        }

        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.60);

        this.textbox.addMessage(
            ev.loc.dialogue.shop[1].replace("%d", String(PRICES[this.id]))
        );
        this.textbox.activate(
            (ev, state) => {

                if (state)
                    this.buy(pl, ev);
            }
        )
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        // Draw sprite
        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        // Draw price
        c.drawText(c.bitmaps.font, String(PRICES[this.id]),
            (this.pos.x) | 0, (this.pos.y|0) + 14, -1, 0, true);

        c.move(-tx, -ty);
    }

}
