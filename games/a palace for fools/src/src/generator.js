//
// A generic generator
//
// (c) 2019 Jani Nykänen
//


export class Generator {


    constructor(obj, count) {

        this.elements = new Array(count);
        for (let i = 0; i < count; ++ i) {

            this.elements[i] = new obj.constructor();
        }
    }


    // Reset
    reset() {

        for (let e of this.elements) {

            e.exist = false;
        }
    }


    // Create an element
    createElement(x, y, sx, sy, id, extra) {

        // Find a bullet that does not exist
        // and spawn it
        let e = null;
        for (let el of this.elements) {

            if (!el.exist) {

                e = el;
                break;
            }
        }
        if (e == null) return null;

        e.spawn(x, y, sx, sy, id, extra);

        return e;
    }


    // Update elements
    updateElements(stage, cam, ev) {

        for (let e of this.elements) {

            stage.getCollisions(e, ev);
            e.update(ev, [cam]);
        }
    }


    // Get player collision with the elements
    playerCollision(pl, ev) {

        for (let e of this.elements) {

            e.playerCollision(pl, ev);
        }
    }


    // Draw elements
    drawElements(c) {

        for (let e of this.elements) {

            e.draw(c);
        }
    }
}
