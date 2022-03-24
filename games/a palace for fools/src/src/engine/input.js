import { GamePad } from "./gamepad.js";

//
// Input manager
// Handles all the input we need,
// mostly (or only?) keyboard
// (c) 2019 Jani Nykänen
//


// Input states
export const State = {
    Up: 0,
    Down: 1,
    Pressed: 2,
    Released: 3
};


export class InputManager {


    constructor() {

        this.keys = [];
        // Actions are defined by user, and it's
        // the right way to get the key input, because
        // action keys can be redefined, but it is sufficient
        // to change only the initialization code. Also,
        // this way we may call preventDefaul only for
        // the keys we need
        this.action = [];
        // This keys will be "preventDefault"ed.
        this.prevent = [];

        // Gamepad manager
        this.gamepad = new GamePad();

        this.anyPressed = false;

        // Set listeners
        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.keyCode))
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.keyCode))
                    e.preventDefault();
            });   
    
        // To get focus only
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });
        // Disable context menu
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });
    }



    // Called when a key pressed
    keyPressed(key) {

        if (this.keys[key] != State.Down) {

            this.anyPressed = true;
            this.keys[key] = State.Pressed;
        }
            

        return this.prevent[key];
    }


    // Called when a key released
    keyReleased(key) {

        if (this.keys[key] != State.Up)
            this.keys[key] = State.Released;

        return this.prevent[key];
    }


    // Update directional actions
    updateDirectionalAction(action) {

        const DELTA = 0.25;

        let axis = action.axis == 0 ? 
            this.gamepad.stick.x : this.gamepad.stick.y;

        let delta = action.axis == 0 ? 
            this.gamepad.delta.x : this.gamepad.delta.y;    
            
        if (Math.abs(delta) > DELTA &&
            ((action.dir > 0 && axis > 0 && delta > 0) ||
             (action.dir < 0 && axis < 0 && delta < 0))) {

            action.state = State.Pressed;
        }
    }


    // Update actions
    updateActions() {

        // Update gamepad
        this.gamepad.update();

        for (let n in this.action) {

            this.action[n].state = this.getKey(this.action[n].key);

            // Check gamepad stick
            if (this.action[n].dir != null && 
                this.action[n].axis != null) {

                this.updateDirectionalAction(this.action[n]);
            }
            
            // Check gamepad buttons
            if (this.action[n].state == State.Up &&
                this.action[n].button != null) {

                this.action[n].state = 
                    this.gamepad.getButtonState(this.action[n].button);

                // Check the alternative button
                if (this.action[n].state == State.Up &&
                    this.action[n].button2 != null) {

                    this.action[n].state = 
                        this.gamepad.getButtonState(this.action[n].button2);
                }
            }
        }
    }


    // Update input states
    updateStates() {

        for (let k in this.keys) {

            if (this.keys[k] == State.Pressed)
                this.keys[k] = State.Down;

            else if(this.keys[k] == State.Released) 
                this.keys[k] = State.Up;
        }

        this.anyPressed = false;
    }


    // Get the key state
    getKey(key) {

        return this.keys[key] | State.Up;
    }


    // Add an action
    addAction(name, key, axis, dir, button, button2) {

        this.action[name] = {

            key: key,
            state: State.Up,
            axis: axis,
            dir: dir,
            button: button,
            button2: button2,
        };
        this.prevent.push(key);
    }


    // If any action occurred
    actionOccurred() {

        return this.gamepad.anyPressed || this.anyPressed;
    }

}
