//
// Bitmap
// Just an abstraction layer between
// Html5 image and this application
//
// (c) 2019 Jani Nykänen
//


export class Bitmap {


    constructor(img) {

        this.img = img;

        this.w = img.width;
        this.h = img.height;
    }

}
