//
// Handles game saving & loading
//
// (c) 2019 Jani Nykänen
//


export class SaveManager {


    constructor() {

        // ...
    }


    // Save game
    saveGame(pl, stage) {

        let d = {};

        // Store items
        d.items = new Array();
        for (let i = 0; i < pl.items.length; ++ i) {

            d.items[i] = pl.items[i];
        }
        d.hcontainers = new Array();
        for (let i = 0; i < pl.hcontainers.length; ++ i) {

            d.hcontainers[i] = pl.hcontainers[i];
        }
        d.purpleBoxes = new Array();
        for (let i = 0; i < pl.purpleBoxes.length; ++ i) {

            d.purpleBoxes[i] = pl.purpleBoxes[i];
        }
        d.checkpoint = pl.checkpoint.clone();
        d.mapID = stage.id;
        d.gems = pl.gems;
        d.maxHealth = pl.maxHealth;
        d.crystalCount = pl.crystalCount;
        d.leverPressed = stage.leverPressed;
        d.hasGem = pl.hasGem;

        let out = JSON.stringify(d);

        localStorage.setItem("apff_savedata", out);
    }


    // Load game
    loadGame(pl, stage) {

        let d = JSON.parse(localStorage.getItem("apff_savedata"));

        pl.checkpoint.x = d.checkpoint.x;
        pl.checkpoint.y = d.checkpoint.y;

        pl.items = [...d.items];
        pl.hcontainers = [...d.hcontainers];
        if (d.purpleBoxes != null)
            pl.purpleBoxes = [...d.purpleBoxes];

        if (d.crystalCount != null)
            pl.crystalCount = d.crystalCount;
        pl.maxHealth = d.maxHealth;
        pl.gems = d.gems;
        pl.hasGem = d.hasGem;

        stage.leverPressed = d.leverPressed;
        stage.id = d.mapID;
    }
}
