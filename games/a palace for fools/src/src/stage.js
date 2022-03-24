import { Tilemap } from "./engine/tilemap.js";
import { Sprite } from "./engine/sprite.js";
import { Dust } from "./dust.js";
import { Bat } from "./bat.js";
import { Beetle } from "./beetle.js";
import { Zombie } from "./zombie.js";
import { Bee } from "./bee.js";
import { Thwomp } from "./thwomp.js";
import { Fish } from "./fish.js";
import { Hat } from "./hat.js";
import { SlimeDrop } from "./slimedrop.js";
import { Replica } from "./replica.js";
import { SkyBeetle } from "./skybeetle.js";
import { Drone } from "./drone.js";
import { Star } from "./star.js";
import { Clam } from "./clam.js";
import { Bunny } from "./bunny.js";
import { HatBeetle } from "./hatbeetle.js";
import { PURPLE_BOX_START } from "./chest.js";
import { SpectralGem } from "./spectralgem.js";
import { Eye } from "./eye.js";

//
// Handles the game stage rendering
// and collision handling etc
//
// (c) 2019 Jani Nykänen
//


export class Stage {


    constructor(id, assets, ev) {

        const DUST_COUNT = 4;

        this.id = id;

        this.maps = [ev.documents.present, 
            ev.documents.past,
            ev.documents.future];
        this.baseMap = this.maps[id];
        this.map = new Tilemap(this.maps[id]);
        this.w = this.map.w;
        this.h = this.map.h;

        this.waterSurface = new Sprite(16, 16);

        this.tilesets = 
             [assets.bitmaps.tilesetA, 
              assets.bitmaps.tilesetB,
              assets.bitmaps.tilesetC];
        this.tileset = this.tilesets[id];

        // Dust for breaking tiles
        this.dust = new Array(DUST_COUNT);
        for (let i = 0; i < DUST_COUNT; ++ i) {

            this.dust[i] = new Dust();
        }

        this.gemCB = null;

        this.propSpr = new Sprite(80, 24);
        this.propWave = 0.0;

        this.leverPressed = false;
    }


    // Set gem callback
    setGemCallback(gemGen) {

        this.gemCB = (o, x, y) => {

            const GEM_SPEED_X = 0.5;
            const GEM_SPEED_Y = 0;
            const GEM_PROB = 0.5;

            if (Math.random() > GEM_PROB) return;

            let dir = o.pos.x < x ? 1 : -1;
            
            gemGen.createElement(
                x, y,
                dir * GEM_SPEED_X,
                -GEM_SPEED_Y,
                0);
        }
    }


    // Reset
    reset(id) {

        if (id != null) {

            this.id = id;

            this.tileset = this.tilesets[id];
            this.baseMap = this.maps[id];
            this.map = new Tilemap(this.maps[id]);
        }

        for (let d of this.dust) {

            d.exist = false;
        }

        this.map = new Tilemap(this.baseMap);
        this.w = this.map.w;
        this.h = this.map.h;
    
        this.propSpr.setFrame(0, 0);
        this.propWave = 0.0;
    }


    // Spawn dust
    spawnDust(x, y, id) {

        const DUST_SPEED = 4;

        let dust = null;
        for (let d of this.dust) {

            if (!d.exist) {

                dust = d;
                break;
            }
        }
        if (dust == null) return;

        dust.spawn(x*16 + 8, y*16 + 8, DUST_SPEED, 1+id);
    }


    // Is the tile solid
    isSolid(x, y, loop) {

        const SOLID = [1, 9, 10, 12, 13, 14];

        let t = this.map.getTile(1, x, y, loop);

        return SOLID.includes(t);
    }


    // Draw a wall tile
    drawWallTile(c, x, y) {

        let ts = this.tileset;

        let tl = this.map.getTile(1, x-1, y-1, true);
        let tr = this.map.getTile(1, x+1, y-1, true);
        let bl = this.map.getTile(1, x-1, y+1, true);
        let br = this.map.getTile(1, x+1, y+1, true);
        
        let l = this.map.getTile(1, x-1, y, true);
        let t = this.map.getTile(1, x, y-1, true);
        let r = this.map.getTile(1, x+1, y, true);
        let b = this.map.getTile(1, x, y+1, true);

        let corners = [l, t, r, b];
        let diagonal = [tl, tr, br, bl];
        
        const PX = [0, 1, 1, 0];
        const PY = [0, 0, 1, 1];

        // If empty everywhere, just draw the background
        // and stop here
        let empty = true;
        for (let i = 0; i < 4; ++ i) {

            if (corners[i] != 1 || diagonal[i] != 1) {

                empty = false;
                break;
            }
        }
        if(empty) {

            c.drawBitmapRegion(ts, 
                0, 0, 16, 16,
                x*16, y*16);
            return;
        }

        // Draw corners
        let sx, sy;
        for (let i = 0; i < 4; ++ i) {

            // No tiles in any direction
            if (corners[i] != 1 && corners[(i+1)%4] != 1) {

                sx = 16 + PX[i] * 8;
                sy = 0 + PY[i] * 8;

                c.drawBitmapRegion(ts, sx, sy, 8, 8,
                    x*16 + PX[i]*8, y*16 + PY[i]*8);
            }
            // Tiles in "all" the directions
            else if (corners[i] == 1 && 
                     corners[(i+1)%4] == 1 &&
                     diagonal[i] != 1) {

                sx = 32 + PX[i] * 8;
                sy = 0 + PY[i] * 8;

                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);
            }

            // No tile in the facing direction,
            // but tile in the next position
            if (corners[i] != 1 &&
                    corners[(i+1)%4] == 1) {

                sx = 48 + PX[i] * 8;
                sy = 0 + PY[i] * 8;
        
                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);        
            }

            // No tile in the facing direction,
            // but tile in the previous position
            if (corners[(i+1)%4] != 1 &&
                corners[i] == 1) {

                sx = 64 + PX[i] * 8;
                sy = 0 + PY[i] * 8;
        
                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);        
            }

            // "Pure wall" tiles
            if (corners[i] == 1 &&
                corners[(i+1)%4] == 1 &&
                diagonal[i] == 1) {

                sx = PX[i] * 8;
                sy = PY[i] * 8;

                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);  
            }
        }

    }


    // Draw ladder
    drawLadder(c, x, y) {

        let ts = this.tileset;

        let up = this.map.getTile(1, x, y - 1, true);
        let drawUp = up != 2 && up != 1;
        if (drawUp) {

            // Draw ladder top
            c.drawBitmapRegion(ts, 
                112, 0, 16, 16,
                x*16, (y-1)*16);  
        }

        // Draw ladder base
        c.drawBitmapRegion(ts, 
            drawUp ? 96 : 80, 0, 16, 16,
            x*16, y*16);  
    }


    // Draw spikes
    drawSpikes(c, t, x, y) {

        let ts = this.tileset;

        const DIR_X = [1, 0, 1, 0];
        const DIR_Y = [0, 1, 0, 1];

        let dx = 0;
        let dy = 0;

        let jump = 0;
        // If not a similar spike (or wall) next to 
        // this spike, make the second spike slightly 
        // different
        let s = this.map.getTile(
            1, x + DIR_X[t], y + DIR_Y[t]);
        if (s != 3 + t && s != 1) {

            jump = 1;
        }

        // Draw both spikes, obviously
        for (let i = 0; i < 2; ++ i) {

            c.drawBitmapRegion(ts, 
                128 + t*16 + dx * jump, 
                dy * jump, 
                8 + DIR_Y[t]*8, 
                8 + DIR_X[t]*8,
                x*16 + dx, 
                y*16 + dy); 

            dx += DIR_X[t] * 8;
            dy += DIR_Y[t] * 8;
        }
    }


    // Draw water
    drawWater(c, x, y, t) {

        let ts = this.tileset;

        if (t == 0) {

            c.drawSprite(this.waterSurface, ts,
                x*16, y*16);
        }
        else {

            c.drawBitmapRegion(ts, 15*16, 0, 16, 16,
                x*16, y*16);
        }
    }


    // Draw breaking wall
    drawBreakingWall(c, x, y, id) {

        let ts = this.tileset;

        let sx = 0;

        if (!this.isSolid(x, y-1, true) &&
            !this.isSolid(x, y+1, true)) {

            sx = 48;
        }
        else if (this.map.getTile(1, x, y-1) != 1) {

            sx = 16
        }
        else if (!this.isSolid(x, y+1, true)) {

            sx = 32;
        }
        else {

            sx = 0;
        }

        c.drawBitmapRegion(ts, 
            sx + id*64, 16, 
            16, 16,
            x*16, y*16);
    }


    // Draw the (mostly static) tiles
    drawTiles(c, sx, sy, w, h) {

        let t;
        for (let y = sy; y < sy + h; ++ y) {

            for (let x = sx; x < sx + w; ++ x) {

                t = this.map.getTile(1, x, y, true);
                switch(t) {

                // Wall
                case 1:

                    this.drawWallTile(c, x, y);
                    break;  

                // Ladder
                case 2:

                    this.drawLadder(c, x, y);
                    break;
                
                // Spikes
                case 3:
                case 4:
                case 5:
                case 6:

                    this.drawSpikes(c, t-3, x, y);
                    break;

                // Water
                case 7:
                case 8:

                    this.drawWater(c, x, y, t-7);
                    break;

                // Breaking tile
                case 9:
                case 10:
                    
                    this.drawBreakingWall(c, x, y, t-9);
                    break;

                // Propeller
                case 13:

                    this.propSpr.draw(c, c.bitmaps.propeller,
                        x*16 - 32, y*16 - 4);
                    break;

                // Keyhole
                case 14:

                    c.drawBitmapRegion(this.tileset, 
                        128, 16, 16, 16, x*16, y*16);
                    break;

                default:
                    break;
                }
            }
        }
    }


    // Draw decorations
    drawDecorations(c, sx, sy, w, h) {

        let t;
        let bsx, bsy;
        for (let y = sy; y < sy + h; ++ y) {

            for (let x = sx; x < sx + w; ++ x) {

                t = this.map.getTile(0, x, y, true) -128;
                if ( (t --) <= 0) continue;
                
                bsx = (t % 16);
                bsy = (t / 16) | 0;

                c.drawBitmapRegion(c.bitmaps.decorations,
                    bsx*16, bsy*16, 16, 16,
                    x*16, y*16);
            }
        }
    }


    // Update stage
    update(ev) {

        const PROPELLER_SPEED = 3;
        const PROP_FLOAT = 0.025;

        this.waterSurface.animate(0, 12, 14, 12, ev.step);

        // Update propeller
        if (this.id == 0)
            this.propSpr.animate(0, 0, 3, PROPELLER_SPEED, ev.step);
        else
            this.propSpr.setFrame(0, 0);
        this.propWave += PROP_FLOAT * ev.step;
        this.propWave %= Math.PI * 2;
            
        // Update dust
        for (let d of this.dust) {

            d.update(ev);
        }
    }


    // Render the current visible map area
    draw(c, cam) {
        
        const X_MARGIN = 2;
        const Y_MARGIN = 1;
        const PROP_AMPLITUDE = 8;

        if (this.id == 0 && 
            (cam.pos.y == 0 || cam.pos.y == ((this.h*16/cam.h)|0) -1) && 
            cam.target.y == cam.pos.y) {

            c.move(0, (Math.sin(this.propWave)*PROP_AMPLITUDE) | 0);
        }
        else {

            this.propWave = 0.0;
        }

        let x = Math.floor(cam.top.x / 16) -X_MARGIN;
        let y = Math.floor(cam.top.y / 16) -Y_MARGIN;
        let w = cam.w/16 + X_MARGIN*2 +1;
        let h = cam.h/16 + Y_MARGIN*2 +1;

        // Draw decorations
        this.drawDecorations(c, x, y, w, h);

        // Draw tiles
        this.drawTiles(c, x, y, w, h);

        // Draw dust
        for (let d of this.dust) {

            d.draw(c, this.id);
        }
    }


    // Get wall collision with an object
    getWallCollision(o, x, y, breakable, ev) {

        const MARGIN = 2;

        let w = null;
        let b = null;

        // Left
        if (!this.isSolid(x-1, y, true)) {

            w = o.verticalCollision(x*16, y*16, 16, -1, ev);
        }

        // Right
        if (!this.isSolid(x+1, y, true)) {

            w = w || o.verticalCollision((x+1)*16, y*16, 16, 1, ev);
        }

        // Break the wall
        if (breakable && o.breakWall > 0 &&
            o.breakWall <= breakable && w) {

            this.map.setTile(1, x, y, 0);
            this.spawnDust(x, y, breakable-1);

            ev.audio.playSample(ev.audio.sounds.breakWall, 0.50);

            // Spawn gem
            if (this.gemCB != null) {

                this.gemCB(o, x*16 + 8, y*16 + 8);
            }

            return;
        }

        // Top
        if (!this.isSolid(x, y-1, true)) {

            // If touched ground while climbing downwards, stop
            // climbing
            b = o.horizontalCollision(
                x*16-MARGIN, y*16, 16+MARGIN*2, 1, ev);
            if (b) {

                if (o.climbing) {

                    o.climbing = false;
                }
            }
        }

        // Bottom
        if (!this.isSolid(x, y+1, true)) {

            b = b || o.horizontalCollision(x*16, (y+1) *16 , 16, -1, ev);
        }

        // "Open"
        if ((w || b) && o.hasKey && breakable == -1) {

            this.map.setTile(1, x, y, 0);
            this.spawnDust(x, y, 2);

            ev.audio.playSample(ev.audio.sounds.open, 0.70);
        }
    }


    // Get ladder collision with an object
    getLadderCollision(o, x, y, ev) {

        const TOP_OFF = 12;

        o.ladderCollision(x*16, y*16, 16, 16);

        // Check if the ladder ends in the tile
        // above
        let s = this.map.getTile(1, x, y-1);
        if (s != 2 && s != 1) {

            if (!o.climbing && !o.ignoreLadder)
                o.horizontalCollision(x*16, y*16, 16, 1, ev);  

            o.ladderCollision(x*16, (y-1)*16+TOP_OFF, 16, 16-TOP_OFF);

        }
    }


    // Get water collision
    getWaterCollision(o, x, y, t) {

        const TOP_OFF = 4;

        o.waterCollision(
            x*16, y*16+TOP_OFF*(1-t), 
            16, 16-TOP_OFF*(1-t));
    }


    // Get spike collision
    getSpikeCollision(o, t, x, y, ev) {

        const START_X = [4, 0, 4, 10];
        const START_Y = [10, 2, 0, 2];
        const WIDTH = [10, 6, 10, 6];
        const HEIGHT = [6, 12, 6, 12];

        o.hurtCollision(
            x*16 + START_X[t], y*16 + START_Y[t],
            WIDTH[t], HEIGHT[t], ev, 2
        );

    }


    // Get collisions with a game object
    getCollisions(o, ev) {

        const RADIUS = 2; 

        let sx = Math.floor(o.pos.x / 16) - RADIUS;
        let sy = Math.floor(o.pos.y / 16) - RADIUS;

        // Bottom collision
        o.hurtCollision(-16, this.h*16, this.w*16 + 32, 1024, 
            ev, 0, true);

        let t;
        for (let y = sy; y <= sy + RADIUS*2; ++ y) {

            for (let x = sx; x <= sx + RADIUS*2; ++ x) {

                t = this.map.getTile(1, x, y, true);
                switch(t) {

                // Wall
                case 1:
                case 9:
                case 10:
                case 12:
                case 14:

                    // Gotta love ?-operator while you can
                    this.getWallCollision(o, x, y, 
                        (t >= 9 && t != 12) ? (t == 14 ? -1 : t-8) : false, 
                        ev);
                    break;

                // Ladder
                case 2:

                    this.getLadderCollision(o, x, y, ev);
                    break;

                // Spikes
                case 3:
                case 4:
                case 5:
                case 6:
                    
                    this.getSpikeCollision(o, t-3, x, y, ev);
                    break;

                // Water
                case 7:
                case 8:

                    this.getWaterCollision(o, x, y, t-7);
                    break;
                    

                // Special floor collision
                case 11:

                    o.horizontalCollision(x*16, y*16, 16, 1, ev);  
                    break;

                // Propeller
                case 13:
                    
                    if (this.id == 0)
                        o.hurtCollision(x*16 - 32, y*16-8, 
                            80, 24, ev, 99);
                    this.getWallCollision(o, x, y, false, ev);

                    break;

                default:
                    break;
                }
            }
        }
    }


    // Parse objects
    parseObjects(objm, id, respawn) {

        const ENEMIES = [
            Bat.prototype,
            Beetle.prototype,
            Zombie.prototype,
            Bee.prototype,
            Thwomp.prototype,
            Fish.prototype,
            Hat.prototype,
            SlimeDrop.prototype,
            Replica.prototype,
            SkyBeetle.prototype,
            Drone.prototype,
            Star.prototype,
            Clam.prototype,
            Bunny.prototype,
            HatBeetle.prototype,
        ];

        let enemyType;
        let t;
        let dx, dy;
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                t = this.map.getTile(2, x, y);
                t -= 16;
                
                if (t <= 0) continue; 
                dx = x*16 + 8;
                dy = y*16 + 8;

                // Check if "NPC"
                if (t >= 33 && t < 81) {

                    if (t < 33 + 16)
                        objm.addNPC(x, y, t-33);
                    else if (t < 49+16)
                        objm.addChest(x, y, t-49);
                    else
                        objm.addChest(x, y, PURPLE_BOX_START + t-65);
                }
                // Check if a heath-container
                else if (t >= 18 && t <= 22) {

                    objm.addChest(x, y, -(t-17));
                }
                // Check if a shop item
                else if (t >= 25 && t <= 32) {

                    objm.addShopItem(x, y, t-25);
                }
                // Check if enemy
                else if (t >= 2 && t <= 16) {

                    enemyType = this.id == 2 ? 
                        SpectralGem.prototype : ENEMIES[t-2];

                    objm.addEnemy(enemyType, dx, dy);
                }
                // The "eye"
                else if (t == 81) {

                    objm.addEnemy(Eye.prototype, dx + 8, dy + 8);
                }
                else {

                    switch(t) {

                    // Player (and the ending
                    // portal)
                    case 1:

                        objm.addPortal(x, y, 2, this);
                        objm.setPlayerPosition(x, y, respawn);
                        break;

                    // Lever
                    case 23:

                        objm.addLever(x, y, this);
                        break;

                    // Portal
                    case 17:

                        objm.addPortal(x, y, id, this);
                        break;

                    // Save point
                    case 24:

                        objm.addSavePoint(x, y);
                        break;

                    default:
                        break; 
                    }
                }
            }
        }
    }

}
