import { FrameEvent } from "./event.js";
import { Canvas } from "./canvas.js";
import { AssetLoader } from "./assets.js";
import { AudioPlayer } from "./audio.js";

//
// Game core
// (c) 2019 Jani Nykänen
//


export class Core {


    constructor(config) {

        // Parse configuration
        this.frameRate = this.getConfParam(config,
            "frameRate", 60);
        this.canvasWidth = this.getConfParam(config,
            "canvasWidth", 320);
        this.canvasHeight = this.getConfParam(config,
            "canvasHeight", 240);   

        // Create components 
        
        this.canvas = new Canvas(this.canvasWidth, 
                                 this.canvasHeight);
        this.assets = new AssetLoader();
        this.ev = new FrameEvent(this.assets);

        // Store references to certain assets to certain
        // objects, to we can easily have access to them
        // later
        this.canvas.bitmaps = this.assets.bitmaps;

        // Compute required values
        this.ev.step = 60.0 / this.frameRate;
        this.target = 1000.0 / this.frameRate;

        // Set some basic events
        window.addEventListener("resize",
            (e) => {
                // No need to get data from the event
                this.canvas.resize(window.innerWidth, 
                    window.innerHeight)
            });

        this.timeSum = 0;
        this.oldTime = 0;

        this.initialized = false;

        this.lang = null;
    }


    // Get parameter from the configuration object.
    // If something goes wrong, return the default
    // value
    getConfParam(conf, param, def) {

        if (conf == null || conf[param] == null)
            return def;

        return conf[param];
    }


    // Draw the loading screen
    drawLoadingScreen(c) {

        let barWidth = c.w / 4;
        let barHeight = barWidth / 8;
    
        // Black background
        c.clear(0);
    
        let t = this.assets.getLoadRatio();
        let x = c.w/2 - barWidth/2;
        let y = c.h/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Draw outlines
        c.setColor(255);
        c.fillRect(x-2, y-2, barWidth+4, barHeight+4);
        c.setColor(0);
        c.fillRect(x-1, y-1, barWidth+2, barHeight+2);
    
        // Draw bar
        let w = (barWidth*t) | 0;
        c.setColor(255);
        c.fillRect(x, y, w, barHeight);
    }


    // Main loop happens here
    loop(ts) {

        // In the case refresh rate gets too low,
        // we don't want the game update its logic
        // more than 5 times (i.e. the minimum fps
        // is 60 / 5 = 12)
        const MAX_REFRESH = 5;

        this.timeSum += ts - this.oldTime;

        // Compute target loop count
        let loopCount = Math.floor(this.timeSum / this.target) | 0;
        if (loopCount > MAX_REFRESH) {

            this.timeSum = MAX_REFRESH * this.target;
            loopCount = MAX_REFRESH;
        }

        // If no looping, no reason to redraw
        let redraw = loopCount > 0;

        // Update game logic
        while ( (loopCount --) > 0) {

            if (this.assets.hasLoaded()) {

                // Initialize scenes now
                if (!this.initialized) {

                    if (this.lang != null) {

                        // Create localization 
                        this.ev.setLocalization(this.assets, this.lang);
                    }
                    // Initialize scenes
                    this.ev.initScenes(this.canvas, this.assets);

                    this.initialized = true;
                }

                // Update canvas events
                this.canvas.update(this.ev);
                // Update frame event
                this.ev.update();
            }
            else {

                // To prevent that the user presses enter
                // in the loading screen and that gets
                // registered
                this.ev.input.updateStates();
            }

            this.timeSum -= this.target;
            redraw = true;
        }

        // (Re)draw the scene
        if (redraw) {

            if (this.assets.hasLoaded()) {
                
                this.ev.drawScene(this.canvas);
            }
            else {

                // Draw loading screen
                this.drawLoadingScreen(this.canvas);
            }
        }

        this.oldTime = ts;

        // Next frame
        window.requestAnimationFrame( 
            (ts) => this.loop(ts) 
        );
    }


    // Add a scene
    addScene(scene, name, active) {

        this.ev.addScene(scene, name, active);
    }


    // Configure "actions", i.e. key configuration,
    // really
    configActions() {

        for (let a of arguments) {

            this.ev.input.addAction(
                a.name, a.key, a.axis, a.dir, 
                a.button, a.button2);
        }
    }


    // Starts the application. Never returns.
    run() {

        // Start the main loop
        this.loop(0);
    }


    // Set localization language
    setLocalization(lang) {

        this.lang = lang;
    }
}
