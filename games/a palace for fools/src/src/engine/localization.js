//
// Localization manager
//
// (c) 2019 Jani Nykänen
//


export class Localization {


    constructor(assets, lang) {

        let doc = assets.documents[lang];

        this.dialogue = new Array();

        // Fech all the dialogue entries
        let root = doc.getElementsByTagName("localization")[0];
        for (let e of root.getElementsByTagName("dialogue")) {

            this.createNewEntry(e);
        }
    }


    // Create a new dialogue entry
    createNewEntry(base) {

        let name = base.getAttribute("id");

        this.dialogue[name] = new Array();

        // Get chunks and store them to an array
        for (let e of base.getElementsByTagName("chunk")) {

            // Store chunk content, but ignore the first character,
            // that is always a line swap
            this.dialogue[name].push(e.textContent.substr(1));
        }
    }
}
