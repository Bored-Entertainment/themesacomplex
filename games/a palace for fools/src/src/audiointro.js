import { State } from "./engine/input.js";
import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";

//
// "Enable audio?" intro screen
//
// (c) 2019 Jani Nykänen
//


export class EnableAudioScreen {


    constructor() {

        // ...
    }


    // Initialize
    init(ev) {

        const GLOBAL_SAMPLE_VOLUME = 0.60;

        ev.audio.setGlobalSampleVolume(GLOBAL_SAMPLE_VOLUME);
        ev.audio.toggle(false);

        this.textbox = new Textbox(ev);

        this.textbox.addMessage(
            ev.loc.dialogue.general[0]
        );
        this.textbox.activate((ev, state) => {

            if (state) {

                ev.audio.toggle(true);
                ev.audio.playSample(ev.audio.sounds.accept, 0.50);
            }

            ev.tr.activate(false, TransitionMode.VerticalBar, 2.0);
            ev.changeScene("created_by");
        });
        this.textbox.cursorPos = 0;
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.textbox.update(ev);
    }


    // Draw 
    draw(c) {

        c.clear(0);

        this.textbox.draw(c);
    }
}
