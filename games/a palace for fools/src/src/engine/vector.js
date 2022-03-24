//
// Basic vector types
// (c) 2019 Jani Nykänen
//


export class Vector2 {

    
    constructor(x,y) {

        this.x = x == null ? 0 : x; 
        this.y = y == null ? 0 : y;
    }


    // Normalize the vector
    normalize() {

        const EPS = 0.001;

        let len = Math.hypot(this.x, this.y);
        if (len < EPS) return;

        this.x /= len;
        this.y /= len;
    }
    

    // Multiply with a scalar
    scalarMul(a) {

        this.x *= a;
        this.y *= a;
    }


    // Return a (deep?) copy of the vector
    clone() { return new Vector2(this.x, this.y); }

}


export class Vector3 {


    constructor(x, y, z) {

        this.x = x == null ? 0 : x; 
        this.y = y == null ? 0 : y;
        this.z = z == null ? 0 : z;
    }


    // Normalize the vector
    normalize() {

        const EPS = 0.001;

        let len = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        if (len < EPS) return;

        this.x /= len;
        this.y /= len;
        this.z /= len;
    }


    // Multiply with a scalar
    scalarMul(a) {

        this.x *= a;
        this.y *= a;
        this.z *= a;
    }


    // Return a (deep?) copy of the vector
    clone() { return new Vector3(this.x, this.y, this.z); }
    

}
