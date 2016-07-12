
var expect = require('chai').expect;
var request = require('request');
var io = require('socket.io-client');
var server = require('../app');

var URL = 'http://localhost:' + server.get('port');

var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Socket events', function() {

    var disconnectClient = function(client) {
        client.disconnect();
        client = null;
    };

    var createClient = function() {
        var client = io.connect(URL, options);
        client.on('connect', function() {});
        return client;
    };

    it('Should broadcast new user once they connect', function(done) {
        var client = createClient();
        client.emit('new user');

        client.on('player joined', function(data) {
            expect(data.id).to.be.a('string');

            disconnectClient(client);
            done();
        });
    });

    it('Should broadcast disconnected user once they disconnect', function(done) {
        var client1 = createClient();
        var client2 = createClient();

        disconnectClient(client1);

        client2.on('player disconnected', function(data) {
            expect(data.id).to.be.a('string');

            disconnectClient(client2);
            done();
        });
    });

    it('Should broadcast keyboard inputs', function(done) {
        var client = createClient();
        client.emit('input', { data: 'UP' });

        client.on('direction', function(payload) {
            expect(payload.data).to.equal('UP');
            expect(payload.timeStamp).to.be.a('number');
            expect(payload.id).to.be.a('string');

            disconnectClient(client);
            done();
        });
    });
});

describe('Page requests', function () {

    it('/', function (done) {
        request.get(URL, function(error, response, body) {
            var type = response.headers["content-type"].split(";")[0];

            expect(error).to.be.null;
            expect(type).to.equal('text/html');
            expect(body).to.contain('/socket.io/socket.io.js');
            expect(body).to.contain('<title>Fajt - host</title>');
            done()
        });
    });

    it('/input', function (done) {
        request.get(URL + '/input', function(error, response, body) {
            var type = response.headers["content-type"].split(";")[0];

            expect(error).to.be.null;
            expect(type).to.equal('text/html');
            expect(body).to.contain('/socket.io/socket.io.js');
            expect(body).to.contain('<title>Fajt - controller</title>');
            done()
        });
    });

    it('error page', function (done) {
        request.get(URL + '/is-not-found', function(error, response, body) {
            var type = response.headers["content-type"].split(";")[0];

            expect(error).to.be.null;
            expect(type).to.equal('text/html');
            expect(body).to.contain('<h1>Not Found</h1>\n<h2>404</h2>\n<pre>Error: Not Found');
            done()
        });
    });
})
