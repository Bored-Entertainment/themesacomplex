import { clamp } from "./util.js";

//
// Simple audio player with
// Howler.js
//
// (c) 2019 Jani Nykänen
//

export class AudioPlayer {


    constructor(sounds) {

        const DEFAULT_VOL = 1.0;

        this.enabled = true;

        // Volume
        this.sampleVol = DEFAULT_VOL;
        this.musicVol = DEFAULT_VOL;

        // Music ID
        this.musicID = null;
        // Music sound
        this.musicSound = null;
        // Volume "cache"
        this.volCache = 0.0;

        this.sounds = sounds;

        this.paused = false;
    }


    // Set global sample volume
    setGlobalSampleVolume(vol) {

        vol = clamp(vol, 0.0, 1.0);
        this.sampleVol = vol;
    }


    // Toggle audio enabled state
    toggle(state) {

        this.enabled = state;
    
        if (!state) {
    
            if (this.musicSound != null && 
                this.musicID != null) {

                this.musicSound.volume(0.0, 
                    this.musicID);
            }
        }
        else {
    
            if (this.musicSound != null && 
                this.musicID != null) {

                this.musicSound.volume(this.volCache, 
                    this.musicID);
            }
        }
    }


    // Fade in music
    fadeInMusic(sound, vol, time) {

        if (!this.enabled) return;

        if (this.musicID == null) {

            this.musicID = sound.play();
            this.musicSound = sound;
        }

        this.volCache = vol * this.musicVol;

        sound.volume(vol * this.musicVol, sound);
        sound.loop(true, this.musicID);
        if (!this.enabled) vol = 0.0;
        sound.fade(0.0, vol * this.musicVol, time, this.musicID);
    }


    // Fade out music
    fadeOutMusic(sound, vol, time) {

        if (!this.enabled) return;

        if (this.musicID == null) {

            this.musicID = sound.play();
            this.musicSound = sound;
        }

        sound.volume(vol * this.musicVol, sound);
        sound.loop(true, this.musicID);
        if (!this.enabled) vol = 0.0;
        sound.fade(vol, 0.0, time, this.musicID);
    }


    // Stop music
    stopMusic() {

        if (!this.enabled) return;

        if (this.musicSound == null || this.musicID == null)
            return;

        this.musicSound.stop(this.musicID);
        this.musicID = null;
        this.musicSound = null;
    }


    // Pause music
    pauseMusic() {

        if (!this.enabled) return;
        
        if (this.paused) return;
        
        if (this.musicSound == null || this.musicID == null)
            return;

        this.musicSound.pause(this.musicID);
        this.paused = true;
    }


    // Resume music
    resumeMusic() {

        if (!this.enabled) return;

        if (!this.paused) return;
        this.paused = false;

        this.musicSound.play(this.musicID);

    }


    // Set music volume (relative)
    setMusicVolume(v) {

        if (!this.enabled) return;

        this.musicSound.volume(
            v == null ? this.volCache : this.volCache * v);
    }


    // Play a sample
    playSample(sound, vol) {

        if (!this.enabled) return;

        vol *= this.sampleVol;

        if (!sound.playID) {

            sound.playID = sound.play();

            sound.volume(vol, sound.playID );
            sound.loop(false, sound.playID );
        }
        else {

            sound.stop(sound.playID);
            sound.volume(vol, sound.playID );
            sound.loop(false, sound.playID );
            sound.play(sound.playID);
        }
    }
}
