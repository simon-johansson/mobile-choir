
const socket = io();
const Tone = require('tone');
const MIDIUtils = require('midiutils');
const $ = require('jquery');
// const QwertyHancock = require('qwerty-hancock');
const nexusui = window.nx;

const MIDIkeyboard = require('./keyboard').init((data) => {
    console.log(data);
    let velocity = data.data2;

    if (velocity) {
        console.log(velocity);
        sendInputStart(data.note, velocity);
    } else {
        sendInputStop(data.note);
    }

    keyboard1.keys.forEach(key => {
        if (data.midi === key.note) keyboard1.toggle(key, velocity);
    })
});

nx.onload = function() {
    keyboard1.sendsTo(data => {
        // console.log(data);
        const note = MIDIUtils.noteNumberToName(data.note).split('-').join('');
        const event = data.on ? 'input:start' : 'input:stop';
        socket.emit(event, {note});
    })

    // matrix1.row = 6;
    // matrix1.col = 8;
    // matrix1.cellBuffer = 10;
    // matrix1.sequenceMode = 'linear'
    // matrix1.bpm = 120;
    // matrix1.on('*', (data) => {
    //     console.log(matrix1.val);
    // })
    // matrix1.init()
    // matrix1.sequence()
}

// const virtualKeyboard = new QwertyHancock({
//     id: "virtual-keyboard",
//     width: (window.innerWidth / 2.1),
//     height: 150,
//     octaves: 2,
//     startNote: "C3",
//     whiteKeyColour: "#ecf0f1",
//     blackKeyColour: "#2c3e50",
//     hoverColour: "#1EDF3E",
//     activeColour: "#7f8c8d"
// });

// virtualKeyboard.keyDown = note => {
//     console.log(note);
//     socket.emit('input:start', { note });
// };

// virtualKeyboard.keyUp = note => {
//     console.log(note);
//     socket.emit('input:stop', { note });
// };

const sendInputStart = (note, velocity) => {
    socket.emit('input:start', { note, velocity });
};

const sendInputStop = (note) => {
    socket.emit('input:stop', { note });
}

socket.on('clients', data => {
    $('.clients .connections').text(data.clients - 1);
})

$('#staccato').on('change', function(event) {
    event.preventDefault();
    socket.emit('input:staccato', { staccato: $(this).prop("checked") });
});
