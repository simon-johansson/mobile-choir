
import Tone from 'tone';

export const synth = new Tone.Synth({
    'oscillator' : {
        'type' : 'pwm',
        'modulationFrequency' : 0.2
    },
    'envelope' : {
        'attack' : 0.02,
        'decay' : 0.1,
        'sustain' : 0.2,
        'release' : 0.9,
    }
}).toMaster();

const polySynth = new Tone.PolySynth(3, Tone.Synth, {
    'oscillator' : {
        'type' : 'fatsawtooth',
        'count' : 3,
        'spread' : 30
    },
    'envelope': {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0.5,
        'release': 0.4,
        'attackCurve' : 'exponential'
    },
}).toMaster();

if (Tone.context.sampleRate !== 44100) {
    polySynth.set('detune', -146);
}

export {polySynth};

export const bell = new Tone.MetalSynth({
    'harmonicity' : 12,
    'resonance' : 800,
    'modulationIndex' : 20,
    'envelope' : {
        'decay' : 0.4,
    },
    'volume' : -15
}).toMaster();

export const conga = new Tone.MembraneSynth({
    'pitchDecay' : 0.008,
    'octaves' : 2,
    'envelope' : {
        'attack' : 0.0006,
        'decay' : 0.5,
        'sustain' : 0
    }
}).toMaster();

export const kick = new Tone.MembraneSynth({
    'envelope' : {
        'sustain' : 0,
        'attack' : 0.02,
        'decay' : 0.8
    },
    'octaves' : 10
}).toMaster();

export const snare = new Tone.NoiseSynth({
    'volume' : -5,
    'envelope' : {
        'attack' : 0.001,
        'decay' : 0.2,
        'sustain' : 0
    },
    'filterEnvelope' : {
        'attack' : 0.001,
        'decay' : 0.1,
        'sustain' : 0
    }
}).toMaster();
