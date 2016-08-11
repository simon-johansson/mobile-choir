
import $ from 'jquery';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';
import NoSleep from 'nosleep.js';
import midiTracks from 'shared/midi';
import {sendFunction, receiveFunction, getLocalTime, isMobileDevice, setBackgroundColor} from 'shared/utils';
import {synth, polySynth, bell, conga, kick, snare} from 'shared/synths';
import {startRepeater} from './repeater';

const socket = io();
const noSleep = new NoSleep();
const repeaterStartTime = 0.024857610000000002;
const repeaterBeatTime = 0.1;
const repeaterNoteLength = '8i';
const repeaterActiveNotes = [];
let repeater = false;
let synced = false;
let sequencer;
const sequencerBPM = 80;
const sequencerSubdivision = '16n';
let matrix = [
    [], [], [], [], [], [], [], [],
    [], [], [], [], [], [], [], []
];

const samples = [
    new Tone.Sampler({'url': 'samples/clap.mp3', 'volume' : -10}).toMaster(),
    new Tone.Sampler({'url': 'samples/tom--8.mp3', 'volume' : -10}).toMaster(),
    new Tone.Sampler({'url': 'samples/hi-hat--10.mp3', 'volume' : -10}).toMaster(),
    new Tone.Sampler({'url': 'samples/snare.mp3', 'volume' : -10}).toMaster(),
    new Tone.Sampler({'url': 'samples/bass--19.mp3', 'volume' : -10}).toMaster(),
];

const $body = $('body');
const $startOverlay = $('#mobile-start');
const $syncScreen = $('#sync-screen');
const $startBtn = $startOverlay.find('#start-button');
const $soundTestBtn = $('button.test-volume');

const startSync = () => {
    $syncScreen.show();

    sync.start(sendFunction, receiveFunction, (msg, report) => {
        // console.log(report);
        if (report.status === 'training' || report.status === 'sync') {
            synced = true;
            $syncScreen.hide();
        } else {
            synced = false;
            $syncScreen.show();
            // Transport stop
        }
    });
};

const startSequencer = () => {
    const instruments = [
        (time) => synth.triggerAttackRelease('C2', '32n', time),
        (time) => bell.triggerAttack(time),
        (time) => conga.triggerAttack('A3', time, Math.random() * 0.5 + 0.5),
        (time) => snare.triggerAttack(time),
        (time) => kick.triggerAttackRelease('E2', '8n', time),
    ];

    sequencer = new Tone.Sequence((time, col) => {
        const column = matrix[col];
        for (let i = 0; i < 6; i++){
            if (column[i] === 1) {
                // instruments[i](time);
                samples[i].triggerAttack(0, time);
            }
        }
    }, Array.from(Array(16).keys()), sequencerSubdivision);
};

const mobileStart = () => {
    $body.addClass('mobile');
    $startOverlay.show();

    StartAudioContext.setContext(Tone.context);
    StartAudioContext.on($startBtn);
    StartAudioContext.onStarted(() => {
        startSync();
        noSleep.enable();
        $startOverlay.remove();
    });
};

const onPlayRepeater = nextTime => {
    if (repeater && synced) {
        polySynth.triggerAttackRelease(repeaterActiveNotes, repeaterNoteLength, getLocalTime(nextTime));
        // Toggle BG color
    }
};

const onKeyboardInput = data => {
    // console.log('output:start')
    repeater ? repeaterActiveNotes.push(data.note) : polySynth.triggerAttack(data.note);
    setBackgroundColor(data.note);
};

const onKeyboardStop = data => {
    // console.log('output:stop')
    if (repeater) {
        repeaterActiveNotes.splice(repeaterActiveNotes.indexOf(data.note), 1);
    } else {
        polySynth.triggerRelease(data.note);
    }
    setBackgroundColor(data.note, true);
};

const onRepeaterChanged = data => {
    // console.log('output:repeater');
    repeater = data.repeater;
};

const onPlayMIDITrack = data => {
    console.log('output:track', data, synced);
    if (synced) {
        const track = midiTracks[data.track];

        Tone.Transport.stop();
        Tone.Transport.position = 0;
        Tone.Transport.loop = true;
        Tone.Transport.start(getLocalTime(data.time));
        track.start(getLocalTime(data.time));
    }
};

const onStopMIDITrack = data => {
    // console.log('output:track:stop');
    if (synced) {
        midiTracks.stop();

        Tone.Transport.stop();
        Tone.Transport.position = 0;
        Tone.Transport.bpm.value = sequencerBPM;
        Tone.Transport.start(0);
    }
};

const onSequencerTime = (data) => {
    matrix = data.matrix;

    Tone.Transport.schedule(function(time){
        if (sequencer) {
            sequencer.stop().start(time);
        }
    }, getLocalTime(data.time));
};

const onSequencerMatrix = (data) => {
    matrix = data.matrix;
};

export const init = () => {
    Tone.Transport.bpm.value = sequencerBPM;
    Tone.Transport.start(0);

    isMobileDevice() ? mobileStart() : startSync();

    startRepeater(repeaterStartTime, repeaterBeatTime, onPlayRepeater);

    Tone.Buffer.on('load', () => {
        startSequencer();
    });

    $soundTestBtn.on('click', () => {
        polySynth.triggerAttackRelease(['A3', 'C4', 'E4'], '100i');
    });

    socket.on('output:start', onKeyboardInput);
    socket.on('output:stop', onKeyboardStop);
    socket.on('output:repeater', onRepeaterChanged);
    socket.on('output:track', onPlayMIDITrack);
    socket.on('output:sequencer', onSequencerTime);
    socket.on('output:sequencer:matrix', onSequencerMatrix);
};
