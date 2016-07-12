
const socket = io();
const $ = require('jquery');
const Tone = require('tone');
const StartAudioContext = require('startaudiocontext');
const Sync = require('./syncClient');
const { play } = require('./playInSync');
const { synth, polySynth } = require('./synths');

const START_TIME = 0.024857610000000002;
const BEAT_TIME = 1;
const NOTE_LENGTH = "8i";

var getTimeFunction = () => { return Tone.context.currentTime; };
let sendFunction = (msg, ...args) => socket.emit(msg, ...args);
let receiveFunction = (msg, callback) => socket.on(msg, callback);

window.sync = new Sync(getTimeFunction);

let started = false;
const startSync = () => {
    sync.start(sendFunction, receiveFunction, (msg, status) => {
        // console.log(msg, status);
        if (status.connection === 'online' && !started) {
            play(START_TIME, BEAT_TIME, (startTime) => {
                const localTime = Math.max(0, sync.getLocalTime(startTime));
                polySynth.triggerAttackRelease('C4', '8i', localTime);
            });
        }
    });
}

socket.on('output:start', data => {
  console.log('output:start')
  //- synth.triggerAttack(data.frequency);
  //- synth.triggerAttack(data.note);
  // polySynth.triggerAttackRelease(data.note, '2');
  $('body')
    .removeClass('A B C D E F G')
    .addClass(data.note.split('')[0]);

  polySynth.triggerAttack(data.note);
});

socket.on('output:stop', data => {
  console.log('output:stop')

  $('body').removeClass(data.note.split('')[0])
  polySynth.triggerRelease(data.note);
});

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
// if(true) {
    $("body").addClass("mobile");
    var element = $("<div>", {id: "mobile-start"}).appendTo("body");
    var button = $("<div>").attr("id", "start-button").text("Enter").appendTo(element);

    StartAudioContext.setContext(Tone.context);
    StartAudioContext.on(button);
    StartAudioContext.onStarted(function(){
        // startSync();
        element.remove();
    });
}

$('button.test-volume').on('click', () => {
    polySynth.triggerAttackRelease(['A3', 'C4', 'E4'], '100i');
});
