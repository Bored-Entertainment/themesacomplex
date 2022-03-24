import { Menu, MenuButton } from "./menu.js";
import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";
import { MUSIC_VOLUME } from "./game.js";
import { State } from "./engine/input.js";

//
// Title screen
//
// (c) 2019 Jani Nykänen
//

const FLICKER_TIME = 60;


export class TitleScreen {

    constructor() {

        this.cursorPos = 0;
        this.logoFrame = 0;
        this.finished = false;

        this.flickerTimer = FLICKER_TIME/2 -1;

        this.phase = 0;
    }


    // Initialize
    init(ev) {

        this.textbox = new Textbox(ev);

        this.menu = new Menu(
            new MenuButton("New Game", (ev) => {

                this.menu.disable();
                ev.tr.activate(true, TransitionMode.Empty, 2.0,
                    (ev) => {
                        
                        ev.changeScene("storyintro");
                    });
            }),
            new MenuButton("Continue", (ev) => {

                try {

                    if (localStorage.getItem("apff_savedata") == null) {

                        this.textbox.addMessage(
                            ev.loc.dialogue.general[4]
                        );
                        this.textbox.activate();
                        return;
                    }
                }
                catch(e) {

                    console.log(e);
                    exist = false;
                    
                    this.textbox.addMessage(
                        ev.loc.dialogue.general[3]
                    );
                    this.textbox.activate();
                    return;
                }

                ev.audio.stopMusic();

                this.menu.disable();
                ev.tr.activate(true, TransitionMode.Empty, 2.0,
                    (ev) => {
                        ev.tr.mode = TransitionMode.VerticalBar;
                        ev.changeScene("game", false);
                    });
            })
        );
        this.menu.activate(0);
    }


    // Update
    update(ev) {

        if (!(this.finished = !ev.tr.active)) {

            this.logoFrame = (4 * (1-ev.tr.getScaledTime())) | 0;
            return;
        }
        this.logoFrame = 3;

        
        // Wait for enter
        if (this.phase == 0) {

            // Flicker
            this.flickerTimer += ev.step;
            this.flickerTimer %= FLICKER_TIME;

            // Check keys
            if (ev.input.action.start.state == State.Pressed ||
                ev.input.action.fire1.state == State.Pressed) {

                ++ this.phase;
                ev.audio.playSample(ev.audio.sounds.pause, 0.60);
            }

            return; 
        }

        if (this.textbox.active) {

            this.textbox.update(ev);
            return;
        }

        this.menu.update(ev);
        
    }


    // Draw 
    draw(c) {

        c.clear(0);
        
        if (this.logoFrame > 0) {

            c.drawBitmapRegion(c.bitmaps.logo, 
                (this.logoFrame-1) *160, 0, 160, 244, 0, 8);
        }
        if (!this.finished)
            return;


        if (this.phase == 0) {

            if (this.flickerTimer >= FLICKER_TIME/2) {

                c.drawText(c.bitmaps.font, "Press Enter",
                    c.w/2, c.h-32, 0, 0, true);
            }
        }
        else {
            
            c.move(0, 32);
            this.menu.draw(c);
            c.moveTo(0, 0);

            this.textbox.draw(c);
        }

        c.drawText(c.bitmaps.font, "©2019 Jani Nykänen",
            c.w/2, c.h-8, 0, 0, true);
    }


    // On change
    onChange(ev) {

        this.menu.activate(0);
        ev.tr.mode = TransitionMode.Empty;

        ev.audio.fadeInMusic(ev.audio.sounds.future, 
            MUSIC_VOLUME, 1000);
    }
}
