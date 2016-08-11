
const socket = io();
import Tone from 'tone';
import $ from 'jquery';

export const getTimeFunction = () => Tone.context.currentTime;
export const sendFunction = (msg, ...args) => socket.emit(msg, ...args);
export const receiveFunction = (msg, callback) => socket.on(msg, callback);
export const getLocalTime = serverTime => Math.max(1, sync.getLocalTime(serverTime));

export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const $body = $('body');
export const setBackgroundColor = (note, remove = false) => {
    const className = note.split('')[0];
    remove ? $body.removeClass(className) : $body.addClass(className);
};

export const keycodeToMIDI = {
    65: 60, 87: 61, 83: 62,
    69: 63, 68: 64, 70: 65,
    84: 66, 71: 67, 89: 68,
    72: 69, 85: 70, 74: 71,
    75: 72, 79: 73, 76: 74,
    80: 75
};

export MIDIUtils from 'midiutils';
