
/**
 * Module dependencies.
 */

var fs = require('fs');
var net = require('net');
var tls = require('tls');
var path = require('path');
var icy = require('../');
var assert = require('assert');

describe('Client', function () {
  describe('fixtures: icy-server-response', function () {
    it('should not get a Parse Error', function (done) {
      var server = net.createServer(function (socket) {
        var file = path.resolve(__dirname, 'fixtures', 'icy-server-response');
        fs.createReadStream(file).pipe(socket);
      });
      server.listen(function () {
        var req = icy.request({
          method: 'GET',
          host: '127.0.0.1',
          port: server.address().port,
          path: '/'
        }, function (res) {
          assert.equal('ICY', res.httpVersion);
          assert.equal('192', res.headers['icy-br']);
          assert.equal('1', res.headers['icy-pub']);
          res.resume();
          server.close();
          done();
        });
        req.end();
      });
    });
  });
  describe('fixtures: icy-server-response-metaint', function () {
    it('should emit a "metadata" event', function (done) {
      var server = net.createServer(function (socket) {
        var file = path.resolve(__dirname, 'fixtures', 'icy-server-response-metaint');
        fs.createReadStream(file).pipe(socket);
      });
      server.listen(function () {
        var req = icy.request({
          method: 'GET',
          host: '127.0.0.1',
          port: server.address().port,
          path: '/'
        }, function (res) {
          //console.error(res);
          assert.equal('ICY', res.httpVersion);
          assert.equal('192', res.headers['icy-br']);
          assert.equal('1', res.headers['icy-pub']);
          assert.equal('32768', res.headers['icy-metaint']);
          res.on('metadata', function (metadata) {
            var m = icy.parse(metadata);
            assert.deepEqual(m, { StreamTitle: 'Johanna - Alive (Greg B Remix)', StreamUrl: '' });
            done();
          });
          res.resume();
          //server.close();
        });
        req.end();
      });
    });
  });
  describe('fixtures: icy-server-https-response', function () {
      it('should not get a Parse Error with https server', function (done) {
        var options = {
            key: fs.readFileSync('test/fixtures/key.pem'),
            cert: fs.readFileSync('test/fixtures/cert.pem')
        };
        //Self signed certificate
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        var server = tls.createServer(options, function (socket) {
          var file = path.resolve(__dirname, 'fixtures', 'icy-server-response');
          fs.createReadStream(file).pipe(socket);
        });
        server.listen(function () {
          var req = icy.request({
            method: 'GET',
            protocol: 'https:',
            host: '127.0.0.1',
            port: server.address().port,
            path: '/'
          }, function (res) {
            assert.equal('ICY', res.httpVersion);
            assert.equal('192', res.headers['icy-br']);
            assert.equal('1', res.headers['icy-pub']);
            res.resume();
            server.close();
            done();
          });
          req.end();
        });
      });
    });

  describe('fixtures: icy-server-https-string-response', function () {
      it('should not get a Parse Error with https server', function (done) {
        var options = {
            key: fs.readFileSync('test/fixtures/key.pem'),
            cert: fs.readFileSync('test/fixtures/cert.pem')
        };
        //Self signed certificate
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        var server = tls.createServer(options, function (socket) {
          var file = path.resolve(__dirname, 'fixtures', 'icy-server-response');
          fs.createReadStream(file).pipe(socket);
        });
        server.listen(function () {
          var req = icy.request('https://127.0.0.1:'+server.address().port,
                                function (res) {
            assert.equal('ICY', res.httpVersion);
            assert.equal('192', res.headers['icy-br']);
            assert.equal('1', res.headers['icy-pub']);
            res.resume();
            server.close();
            done();
          });
          req.end();
        });
      });
    });
});
