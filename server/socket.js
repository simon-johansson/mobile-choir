
const socketio = require('socket.io');
const getTimeFunction = require('./getTime');
const Sync = require('./syncServer');
const sync = new Sync(getTimeFunction);
let io;

const onConnection = socket => {
    let sendFunction = (msg, ...args) => socket.emit(msg, ...args);
    let receiveFunction = (msg, callback) => socket.on(msg, callback);
    sync.start(sendFunction, receiveFunction);

    io.emit('clients', {
        clients: Object.keys(io.clients().sockets).length
    });

    socket.on('input:start', data => {
        // console.log('input:start');
        io.emit('output:start', data);
    });

    socket.on('input:stop', data => {
        // console.log('input:stop');
        io.emit('output:stop', data);
    });

    socket.on('input:repeater', data => {
        // console.log('input:repeater');
        io.emit('output:repeater', data);
    });

    socket.on('input:track', (data) => {
        // console.log('input:track');
        io.emit('output:track', {
            time: sync.getSyncTime() + 1,
            track: data.track
        });
    });

    socket.on('input:sequencer', data => {
        // console.log('input:sequencer');
        io.emit('output:sequencer', data);
    });

    socket.on('input:sequencer:matrix', data => {
        // console.log('input:sequencer');
        io.emit('output:sequencer:matrix', data);
    });

    socket.on('disconnect', () => {
        io.emit('clients', {
            clients: Object.keys(io.clients().sockets).length
        });
    });
};

const init = server => {
    io = socketio(server);
    io.on('connection', onConnection);
};

module.exports = {init};
