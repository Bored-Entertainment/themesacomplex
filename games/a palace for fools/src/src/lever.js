import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";
import { TransitionMode } from "./engine/transition.js";

//
// A lever. Activates portals.
//
// (c) 2019 Jani Nykänen
//


export class Lever extends RenderedObject {

    
    constructor(x, y, id, textbox, pl, stage, shardCount) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        this.flip = Flip.None;
        this.active = stage == null ? true :
            (stage.id == 0 && !stage.leverPressed)
            || (stage.id == 1 && !pl.hasGem);

        this.id = stage == null ? 2 : stage.id;

        if (stage == null || stage.id != 1)
            this.spr.setFrame(0, this.active ? 2 : 3);
        else
            this.spr.setFrame(0, 4);

        this.inCamera = false;
    
        this.shardCount = shardCount;
        this.textbox = textbox;

        this.spawning = stage == null;
        this.spawnSpr = new Sprite(16, 16);
        this.spawnSpr.setFrame(1, 4);
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        // Animate spawn effect
        if (this.spawning) {

            this.spawnSpr.animate(1, 4, 8, 5, ev.step);
            if (this.spawnSpr.frame == 8)
                this.spawning = false;
        }

        if (this.id == 1) {

            this.spr.animate(0, 4, 7, 6, ev.step);
        }
    }


    // Activation event
    activationEvent(pl, stage, ev) {

        const WAIT_TIME = 90;
        const ITEM_WAIT = 30;
        const ITEM_SPEED = -1.0;

        // Play audio
        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.70);
        ev.audio.playSample(
            ev.audio.sounds[ ["lever", "craft", "recreate"] [this.id] ], 
            0.70);

        // If fire, start "gem obtained"
        // animation after shaking            
        if (this.id == 1) {

            this.textbox.setEndCallback((ev) => {

                    this.active = false;

                    // Set player frame
                    pl.spr.setFrame(4, 3);

                    // Play sound
                    ev.audio.playSample(ev.audio.sounds.item, 
                        0.50);

                    // Activate a new textbox
                    this.textbox.activate(WAIT_TIME, 7, 
                        new Vector2(this.pos.x, this.pos.y-8), 
                        ITEM_SPEED, ITEM_WAIT)
                    }
                );
        }

        if (this.id != 1) {

            stage.leverPressed = true;
            ++ this.spr.frame;
            this.active = false;
        }
        else {

            pl.hasGem = true;
        }
            
        // Set player position & frame
        pl.pos.x = this.pos.x;
        pl.spr.setFrame(3, 3);
        pl.showArrow = false;
        pl.stopMovement();
    }


    // Activate
    activate(pl, stage, ev) {

        const SHAKE_MAG = 4;
        const SHAKE_MAG2 = 8;
        const WAIT_TIME1 = 120;
        const WAIT_TIME2 = 240;
        
        let id = "lever" + String(this.id);
        let shardsCollected = pl.crystalCount >= this.shardCount;
        if (this.id == 1 && !shardsCollected) {

            id += "_fail";
        }

        this.textbox.addMessage(
            ...ev.loc.dialogue[id]
        );
        
        if (this.id == 2) {

            ev.audio.playSample(
                ev.audio.sounds.accept, 
                0.60);

            this.textbox.activate((ev, state) => {
                
                if (state) {

                    // We need to push some message to it,
                    // but it is never shown
                    this.textbox.addMessage(
                        "null"
                    );
                    this.textbox.activate(WAIT_TIME2, 
                        -SHAKE_MAG2, null, 
                        0.0, 0.0);
                    this.activationEvent(pl, stage, ev);

                    // Start transition to the ending
                    ev.tr.activate(true, TransitionMode.CircleInside,
                        0.25, (ev) => {
                            ev.changeScene("ending");
                            ev.tr.disable();
                        });
                    ev.tr.setCenter(80, 72);
                }
            });
        }
        else if (this.id == 0 || shardsCollected) {

            this.textbox.activate(WAIT_TIME1, 
                -SHAKE_MAG, null, 
                0.0, 0.0);
            this.activationEvent(pl, stage, ev);
        }
        else {

            ev.audio.playSample(
                ev.audio.sounds.deny, 
                0.60);

            this.textbox.activate();
            return;
        }
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        if (!this.active && this.id == 1) return;

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        // Draw spawning dust
        if (this.spawning) {

            c.drawSprite(this.spawnSpr, c.bitmaps.npc,
                (this.pos.x-8) | 0,
                (this.pos.y-8) | 0,
                this.flip);
        }

        c.move(-tx, -ty);
    }

}
