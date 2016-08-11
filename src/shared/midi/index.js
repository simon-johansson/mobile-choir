
import Tone from 'tone';
import {polySynth} from 'shared/synths';
import {setBackgroundColor} from 'shared/utils';

import marioData from './mario';
import jumpData from './jump';

class MIDITrack {
    constructor(options) {
        this.data = options.data;
        this.bpm = options.bpm;
        this.loop = options.loop || false;
        this.loopEnd = options.loopEnd || false;

        if (Array.isArray(this.data[0])) {
            this.voiceIndex = Math.floor(Math.random() * this.data.length);
            this.voiceData = this.data[this.voiceIndex];
        } else {
            this.voiceData = this.data;
        }
        this.instrument = options.instruments[this.voiceIndex] || polySynth;

        this.part = new Tone.Part((time, note) => {
            this.instrument.triggerAttackRelease(note.noteName, note.duration, time, note.velocity);
            setBackgroundColor(note.noteName);
        }, this.voiceData);
    }

    start(time) {
        Tone.Transport.bpm.value = this.bpm;
        this.part.loop = this.loop;
        this.part.loopEnd = this.loopEnd;
        this.part.start(0);
    }

    stop() {
        this.part.stop(0);
    }
}

export default {
    mario: new MIDITrack({
        data: marioData,
        bpm: 105,
        loop: false,
        instruments: []
    }),
    jump: new MIDITrack({
        data: jumpData,
        bpm: 132,
        loop: true,
        loopEnd: '4m',
        instruments: []
    }),
};
