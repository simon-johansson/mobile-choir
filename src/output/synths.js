
import Tone from 'tone';

export const synth = new Tone.Synth({
    "oscillator" : {
        "type" : "pwm",
        "modulationFrequency" : 0.2
    },
    "envelope" : {
        "attack" : 0.02,
        "decay" : 0.1,
        "sustain" : 0.2,
        "release" : 0.9,
    }
}).toMaster();

export const polySynth = new Tone.PolySynth(3, Tone.Synth, {
    "oscillator" : {
        "type" : "fatsawtooth",
        "count" : 3,
        "spread" : 30
    },
    "envelope": {
        "attack": 0.01,
        "decay": 0.1,
        "sustain": 0.5,
        "release": 0.4,
        "attackCurve" : "exponential"
    },
}).toMaster();
