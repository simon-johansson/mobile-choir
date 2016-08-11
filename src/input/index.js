
import $ from 'jquery';
import Tone from 'tone';
import {sendFunction, receiveFunction, MIDIUtils, keycodeToMIDI} from 'shared/utils';

const socket = io();
let synced = false;
const keyStates = [];

const sequencerBPM = 80;
const sequencerSubdivision = '16n';
const sequencer = new Tone.Sequence((time, col) => {
    if (col === 4) onNextSubdivision();
    nxMatrix.jumpToCol(col);
}, Array.from(Array(16).keys()), sequencerSubdivision);

const nxAccentColor = '#f1c40f';
const nxBorderColor = '#828282';
const nxMatrixRow = 5;
const nxMatrixCol = 16;
const nxMatrixCellBuffer = 10;
const nxMatrixOnResize = () => $('#step-sequencer').width() - 80;

const $clientConnections = $('.clients .connections');
const $repeater = $('#repeater');
const $trackSelect = $('select');
const $startMidiBtn = $('#start-midi-track');
const $stopMidiBtn = $('#stop-midi-track');

sync.start(sendFunction, receiveFunction, (msg, report) => {
    if (report.status === 'training' || report.status === 'sync') {
        synced = true;
        // Synced!
    } else {
        synced = false;
        // Syncing...
    }
});

const MIDIkeyboard = require('./keyboard').init((data) => {
    const note = data.midi;
    const velocity = data.data2;
    let outOfRange = true;

    nxKeyboard.keys.forEach(key => {
        if (note === key.note) {
            nxKeyboard.toggle(key, velocity);
            outOfRange = false;
        }
    });

    if (outOfRange) sendKeyboardInput(note, velocity);
});

const onNexusLoaded = () => {
    nx.colorize(nxAccentColor);
    nx.colorize('border', nxBorderColor);

    nxKeyboard.sendsTo(data => {
        // console.log(data);
        const note = MIDIUtils.noteNumberToName(data.note).split('-').join('');
        const velocity = data.data2;
        sendKeyboardInput(note, data.on);
    });

    nxMatrix.row = nxMatrixRow;
    nxMatrix.col = nxMatrixCol;
    nxMatrix.cellBuffer = nxMatrixCellBuffer;
    nxMatrix.init();
    nxMatrix.resize(nxMatrixOnResize());
    nxMatrix.draw();

    sequencer.start(0);

    $(nxMatrix.canvas).on('click', sendMatrix);

    $(window).on('resize', function(){
        nxMatrix.resize(nxMatrixOnResize());
        nxMatrix.draw();
    });
};

const sendMatrix = () => {
    socket.emit('input:sequencer:matrix', {
        matrix: nxMatrix.matrix,
    });
};

const sendKeyboardInput = (note, velocity) => {
    if (velocity) {
        socket.emit('input:start', {note, velocity});
    } else {
        socket.emit('input:stop', {note});
    }
};

const sendSequencerTime = nextSubdivision => {
    socket.emit('input:sequencer', {
        time: sync.getSyncTime(nextSubdivision),
        matrix: nxMatrix.matrix,
    });
};

const onNewClient = (data) => {
    $clientConnections.text(data.clients - 1);
};

const onRepeaterChange = () => {
    socket.emit('input:repeater', {
        repeater: $repeater.prop('checked')
    });
};

const onTrackStart = () => {
    const track = $trackSelect.val();
    console.log(track);
    socket.emit('input:track', {track});
};

const onKeyPressed = (event) => {
    // event.preventDefault();
    const keydown = event.handleObj.type === 'keydown' ? true : false;
    const keycode = event.keyCode;

    for (let pressed of keyStates) {
        if (pressed === keycode) {
            if (keydown) { return; }
            else {
                let index = keyStates.indexOf(pressed);
                keyStates.splice(index, 1);
            }
        }
    }

    if (keydown) keyStates.push(keycode);

    const findKey = (note) => {
        nxKeyboard.keys.forEach(key => {
            if (note === key.note) nxKeyboard.toggle(key, keydown);
        });
    };

    findKey(keycodeToMIDI[keycode]);
};

const onNextSubdivision = () => {
    const nextSubdivision = Tone.Transport.nextSubdivision('1m');
    sendSequencerTime(nextSubdivision);
    Tone.Transport.schedule((time) => {
        sequencer.stop().start(time);
    }, nextSubdivision);
};

export const init = () => {
    Tone.Transport.bpm.value = sequencerBPM;
    Tone.Transport.start(0);

    nx.onload = onNexusLoaded;
    socket.on('clients', onNewClient);
    $repeater.on('change', onRepeaterChange);
    $startMidiBtn.on('click', onTrackStart);
    $(document).on('keydown keyup', onKeyPressed);
};


