import { negMod, clamp } from "./util.js";

//
// A tilemap
//
// (c) 2019 Jani Nykänen
//


export class Tilemap {


    constructor(doc) {

        // Get dimensions
        let root = doc.getElementsByTagName("map")[0];
        this.w = String(root.getAttribute("width"));
        this.h = String(root.getAttribute("height"));
        
        // Get layers
        let data = root.getElementsByTagName("layer");
        this.layers = new Array();
        let str, content;
        for (let i = 0; i < data.length; ++ i) {

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0].
                childNodes[0].
                nodeValue.
                replace(/(\r\n|\n|\r)/gm, "");
            // Put to an array
            content = str.split(",");

            // Create a new layer
            this.layers.push(new Array());
            for (let j = 0; j < content.length; ++ j) {

                this.layers[i][j] = parseInt(content[j]);
            }
        }
    }


    // Get a tile value in the given coordinate
    getTile(layer, x, y, loopx, loopy) {

        if (loopx) 
            x = negMod(x, this.w);
        else 
            x = clamp(x, 0, this.w-1);

        if (loopy) 
            y = negMod(y, this.h);
        else 
            y = clamp(y, 0, this.h-1);
        

        return this.layers[layer][y*this.w+x];
    }


    // Set tile value
    setTile(layer, x, y, v) {

        x = negMod(x, this.w);
        y = negMod(y, this.h);

        this.layers[layer][y*this.w+x] = v;
    }
}
