import { Bitmap } from "./bitmap.js";

//
// An asset loader/manager
// (c) 2019 Jani Nykänen
//


export class AssetLoader {


    constructor(gl) {

        this.total = 0;
        this.loaded = 0;

        // Assets
        this.bitmaps = [];
        this.sounds = [];
        this.documents = [];

        this.gl = gl;
    }


    // Start loading a bitmap
    loadBitmap(src, name) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            this.bitmaps[name] = new Bitmap(image);
            ++ this.loaded;
        }
        image.src = src;
    }


    // Load a textg document
    loadDocument(src, cb) {

        ++ this.total;

        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/xml");
        xobj.open("GET", src, true);

        // When loaded
        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    cb(xobj.responseText);
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    // Load an XML document
    loadXML(src, name) {

        this.loadDocument(src, (t) => {

            let parser = new DOMParser();
            this.documents[name] = parser.parseFromString(t,"text/xml");
        });
    }

    
    // Load a sound
    loadSound(src, name) {

        ++ this.total;
    
        if (typeof(Howl) != "undefined") {

            this.sounds[name] = new Howl({

                src: [src],
                onload: () => { ++ this.loaded;}
            });
        }
    }


    // Add sounds
    addSounds(any) {

        for (let a of arguments) {

            this.loadSound(a.src, a.name);
        }
    }


    // Add bitmaps to be loaded
    addBitmaps() {

        for (let a of arguments) {

            this.loadBitmap(a.src, a.name);
        }
    }


    // Add documents to be loaded
    addDocuments() {

        for (let a of arguments) {

            this.loadXML(a.src, a.name);
        }
    }


    // Check if all the assets have been loaded
    // (in the case there were in the first place)
    hasLoaded() {

        return this.total == 0 ||
            (this.total == this.loaded);
    }


    // Get the ratio of loaded assets
    // out of assets to be loaded, in
    // scale [0, 1]
    getLoadRatio() {

        return (this.total == 0 ? 1 : this.loaded/this.total);
    }

}
