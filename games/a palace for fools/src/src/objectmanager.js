import { Player } from "./player.js";
import { Gem } from "./gem.js";
import { Generator } from "./generator.js";
import { Bullet } from "./bullet.js";
import { Portal } from "./portal.js";
import { NPC } from "./npc.js";
import { Chest } from "./chest.js";
import { ShopItem } from "./shopitem.js";
import { SavePoint } from "./savepoint.js";
import { SaveManager } from "./savemanager.js";
import { Lever } from "./lever.js";

//
// Object manager. Handles the game objects,
// like player & enemies
//
// (c) 2019 Jani Nykänen
//


export class ObjectManager {


    constructor(portalCB, textbox, shardCount) {

        const GEM_COUNT = 8;
        const BULLET_COUNT = 16;

        this.player = new Player(0, 0);
        this.enemies = new Array();
        this.portals = new Array();
        this.npcs = new Array();
        this.chests = new Array();
        this.shopItems = new Array();
        this.savepoints = new Array();
        this.levers = new Array();

        this.playerCreated = false;

        this.bgen = new Generator(Bullet.prototype, BULLET_COUNT);
        this.gemGen = new Generator(Gem.prototype, GEM_COUNT);

        this.portalCB = portalCB;
        this.textbox = textbox;
        this.shardCount = shardCount;
    }


    // Get gem generator
    getGemGenerator() {

        return this.gemGen;
    }


    // Set player position
    setPlayerPosition(x, y, respawn) {

        // If not respawning, set player pose
        if (!respawn)  {

            this.player.setPortalPose(false);
            return;
        }

        if (this.playerCreated) {

            return;
        }
        this.playerCreated = true;

        // TODO: setPos for player?
        this.player.pos.x = x*16 + 8;
        this.player.pos.y = (y+1)*16 -6;

        this.player.checkpoint = this.player.pos.clone();
    }


    // Add an enemy
    addEnemy(type, x, y) {

        this.enemies.push(new type.constructor(x, y));
    }


    // Add a portal
    addPortal(x, y, id, stage) {

        this.portals.push(
            new Portal(x*16 + 8, y*16, id, 
                this.portalCB, stage, 
                this.player,
                this.textbox)
        );
    }


    // Add an NPC
    addNPC(x, y, id) {

        this.npcs.push(
            new NPC(x*16 + 8, y*16 + 8, id, this.textbox)
        );
    }


    // Add a chest
    addChest(x, y, id) {

        this.chests.push(
            new Chest(x*16 + 8, y*16 + 8, id, 
                this.textbox, this.player,
                this.shardCount)
        );
    }


    // Add a shop item
    addShopItem(x, y, id) {

        this.shopItems.push(
            new ShopItem(x*16 + 8, y*16 + 8, id, 
                this.textbox,  this.player,
                this.shardCount)
        );
    }


    // Add a save point
    addSavePoint(x, y) {

        this.savepoints.push(
            new SavePoint(x*16 + 8, y*16 + 8, 
                this.textbox, this.player)
        );
    }

    
    // Add a lever
    addLever(x, y, stage) {

        this.levers.push(
            new Lever(x*16 + 8, y*16 + 8, 0,
                this.textbox, this.player, stage,
                this.shardCount)
        );
    }


    // Update an array of "rendered objects"
    updateRenderedObjectArray(arr, stage, cam, ev) {
        
        for (let n of arr) {

            n.isInCamera(cam, ev, false);
            n.update(this.player, ev, stage);
            n.playerCollision(this.player, stage, ev);
        }
    }


    // Update 
    update(stage, cam, ev) {

        // Update enemies
        for (let e of this.enemies) {

            e.isInCamera(cam, ev);
            e.update(ev, [this.player, this.gemGen, this.bgen, this]);

            // Collisions
            if (e.exist) {

                for (let b of this.bgen.elements) {

                    e.bulletCollision(b, ev);
                }

                // Enemy-to-enemy collision
                for (let e2 of this.enemies) {

                    if (e2 == e) continue;

                    e.enemyToEnemyCollision(e2);
                }
            }
            stage.getCollisions(e, ev);
            e.cameraCollision(cam, ev);
            
        }

        // Update player
        this.player.update(ev, [this.bgen]);
        for (let b of this.bgen.elements) {

            this.player.bulletCollision(b, ev);
        }
        // Get collisions with the stage
        stage.getCollisions(this.player, ev);

        // Update bullets
        this.bgen.updateElements(stage, cam, ev);
        // Update gems
        this.gemGen.updateElements(stage, cam, ev);
        this.gemGen.playerCollision(this.player, ev);

        // Update save points
        this.updateRenderedObjectArray(this.savepoints, stage, cam, ev);
        // Update chests
        this.updateRenderedObjectArray(this.chests, stage, cam, ev);
        // Update NPCs
        this.updateRenderedObjectArray(this.npcs, stage, cam, ev);
        // Update portals
        this.updateRenderedObjectArray(this.portals, stage, cam, ev);
        // Update shop items
        this.updateRenderedObjectArray(this.shopItems, stage, cam, ev);
        // Update levers
        this.updateRenderedObjectArray(this.levers, stage, cam, ev);
    }


    // Draw an array of "rendered objects"
    drawRenderedObjectArray(o, c, stage, cam) {

        for (let n of o) {

            n.draw(c, stage, cam);
        }
    }


    // Draw
    draw(c, cam, stage) {

        // Draw levers
        this.drawRenderedObjectArray(this.levers, c, stage, cam);
        // Draw save points
        this.drawRenderedObjectArray(this.savepoints, c, stage, cam);
        // Draw portals
        this.drawRenderedObjectArray(this.portals, c, stage, cam);
        // Draw NPCs
        this.drawRenderedObjectArray(this.npcs, c, stage, cam);
        // Draw chests
        this.drawRenderedObjectArray(this.chests, c, stage, cam);
        // Draw shop items
        this.drawRenderedObjectArray(this.shopItems, c, stage, cam);

        // "Pre-render" specific enemy parts
        for (let e of this.enemies) {

            if (e.preRender != null) {

                e.preRenderAll(c, stage, cam);
            }
        }

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c, stage, cam);
        }

        // Draw player
        this.player.draw(c, cam, stage);
        // Draw gems
        this.gemGen.drawElements(c);
        // Draw bullets
        this.bgen.drawElements(c);
    }


    // Post draw
    postDraw(c) {

        for (let e of this.enemies) {

            if (e.exist && !e.dying && e.inCamera &&
                e.postDraw != null) {

                e.postDraw(c);
            }
        }
    }


    // Update camera movement actions
    // TODO: Rename this
    updateCamMovement(cam, stage, ev) {

        // If teleporting, animate player teleporting
        // animation
        this.player.animateTeleporting(ev);

        if (stage != null) {
            
            // Make the player move if the camera
            // is moving, too
            this.player.updateCamMovement(
                cam, stage, ev);
        }

        // Check if other objects outside
        // the camera area
        let arr = [this.enemies, this.portals,
                   this.npcs, this.chests,
                   this.shopItems, this.savepoints,
                   this.levers ];
        for (let a of arr) {

            for (let e of a) {

                e.isInCamera(cam, ev, true);
            }
        }
    }


    // Is the player dead
    playerDead() {

        return this.player.isDead();
    }

    
    // Reset
    reset(cam, id) {
        
        if (id == null)
            this.player.respawn(cam);

        // this.player.setRespawnPose();

        this.portals = new Array();
        this.enemies = new Array();
        this.npcs = new Array();
        this.chests = new Array();
        this.shopItems = new Array();
        this.savepoints = new Array();
        this.levers = new Array();

        this.bgen.reset();
        this.gemGen.reset();
    }


    // Check death
    checkDeath(ev) {

        if (this.player.dying) {

            this.player.die(ev);
        }
    }


    // Update camera
    updateCamera(cam, stage, ev) {

        // Update camera
        this.player.updateCamera(cam, stage, ev);
    }


    // Get gem count
    getGemCount() {

        return this.player.gems;
    }


    // Get player health
    getPlayerHealth() {

        return this.player.health;
    }


    // Get player max health
    getPlayerMaxHealth() {

        return this.player.maxHealth;
    }


    // Set initial camera position
    setInitialCamera(cam) {

        cam.focus(this.player);

        cam.update(null);
    }


    // Kill the player
    killPlayer(ev) {

        this.player.kill(ev);
    }


    // Parse save data
    parseSaveData(stage) {

        let sman = new SaveManager();
        sman.loadGame(this.player, stage);
    }


    // Get the player position
    getPlayerPos() {

        return this.player.pos;
    }


    // Check if the player has the 
    // map of the current area
    checkMap(stage) {

        return (stage.id == 0 && this.player.items[18]) ||
            (stage.id == 1 && this.player.items[23]); 
    }


    // Automatically position the player,
    // that is, put him/her to the middle
    // of the bottom screen
    autoPos(stage, cam, ev) {

        this.player.pos.x = stage.w*16 / 2;
        this.player.pos.y = (stage.h-1) * 16 -6;
        this.player.checkpoint = this.player.pos.clone();

        cam.focus(this.player);
        cam.update(null);   

        // This should not happen here but who
        // gives a fuck
        let x = this.player.pos.x % cam.w;
        let y = this.player.pos.y % cam.h;

        ev.tr.setCenter(x, y);
    }
}

