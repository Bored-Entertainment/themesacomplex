import { InputManager } from "./input.js";
import { AudioPlayer } from "./audio.js";
import { Transition } from "./transition.js";
import { Localization } from "./localization.js";

//
// Event
// Has information of most things needed
// in the update function (i.e. the function
// that refreshes the game logic)
// (c) 2019 Jani Nykänen
//


export class FrameEvent {


    constructor(assets) {

        this.step = 1;

        // Scenes
        this.scenes = [];
        this.activeScene = null;

        this.input = new InputManager();
        this.audio = new AudioPlayer(assets.sounds);
        this.tr = new Transition();

        this.documents = assets.documents;

        this.loc = null;
    }


    // Set localization
    setLocalization(assets, lang) {

        this.loc = new Localization(assets, lang);
    }


    // Initialize all the scenes
    initScenes(assets) {

        for (let k in this.scenes) {

            if (this.scenes[k].init != null) {

                this.scenes[k].init(this, assets);
            }
        }
    }


    // Update event components (like input)
    update() {

        // Update actions states
        this.input.updateActions();

        // Update transition
        this.tr.update(this);

        // Call user-defined update function
        if (this.activeScene != null && 
            this.activeScene.update != null) {

            this.activeScene.update(this);
        }

        // Update input states
        this.input.updateStates();
    }


    // Draw the current scene
    drawScene(c) {

        if (this.activeScene != null &&
            this.activeScene.draw != null) {

            this.activeScene.draw(c);
        }

        // Draw transition
        this.tr.draw(c);
    }


    // Add a scene
    addScene(s, name, active) {

        this.scenes[name] = s;
        if (active)
            this.activeScene = s;
    }


    // Change the active scene
    changeScene(name, params) {

        for (let k in this.scenes) {

            if (k == name)
                this.activeScene = this.scenes[k];
        }

        if (this.activeScene.onChange != null) {

            this.activeScene.onChange(this, params);
        }
    }
}
