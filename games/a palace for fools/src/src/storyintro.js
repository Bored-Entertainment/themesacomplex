import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";

//
// The story intro
//
// (c) 2019 Jani Nykänen
//


export class StoryIntro {

    constructor() {

        this.frame = 0;
    }


    // Initialize
    init(ev) {

        this.textbox = new Textbox(ev);
    }


    // Update
    update(ev) {

        if (ev.tr.active) {

            this.frame = (4 * ev.tr.getScaledTime()) | 0;
            if (!ev.fadeIn) {

                this.frame = 3 - this.frame;
            }
            return;
        }

        this.textbox.update(ev);

        if (!this.textbox.active) {

            ev.tr.activate(true, TransitionMode.Empty, 2.0,
                (ev) => {

                    ev.audio.stopMusic();
                    ev.changeScene("game", true);
                    ev.tr.mode = TransitionMode.CircleOutside;
                    ev.tr.setCenter();
                    ev.tr.speed = 1.0;
                });
        }
    }


    // Draw 
    draw(c) {

        c.clear(0);

        c.drawBitmapRegion(c.bitmaps.intro,
            0, this.frame*144, 160, 144,
            0, 0);
        
        this.textbox.draw(c, true);
    }


    // On change
    onChange(ev) {

        ev.tr.mode = TransitionMode.Empty;

        this.textbox.addMessage(
            ...ev.loc.dialogue.story
        );
    
        this.textbox.activate();
        this.textbox.doNotResumeMusic();

        this.frame = 0;
    }
}
