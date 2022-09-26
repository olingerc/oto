/**
 * Created by Andrew D.Laptev<a.d.laptev@gmail.com> on 30.03.15.
 */

// https://github.com/agsh/rtsp-ffmpeg

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const rtsp = require('rtsp-ffmpeg')
const fs = require("fs");

server.listen(6147, function(){
 console.log('Listening on localhost:6147');
});

Stream = require('node-rtsp-stream');

const camUser = fs.readFileSync("/run/secrets/CAM_USER").toString().trim();
const camPw = fs.readFileSync("/run/secrets/CAM_PW").toString().trim();

const cams = [
  `rtsp://${camUser}:${camPw}@192.168.178.88:554/h264Preview_01_main`,
  // 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
  //, 'rtsp://freja.hiof.no:1935/rtplive/definst/hessdalen03.stream'
  //, 'udp://localhost:1234'
];
 
cams.map(function(uri, i) {
let stream = new rtsp.FFMpeg({input: uri});
  stream.on('start', function() {
    console.log('stream ' + i + ' started');
  });
  stream.on('stop', function() {
    console.log('stream ' + i + ' stopped');
  });
  return stream;
});

cams.forEach(function(camStream, i) {
  let ns = io.of('/cam' + i);
  ns.on('connection', function(wsocket) {
    console.log('connected to /cam' + i);
    let pipeStream = function(data) {
      wsocket.emit('data', data);
    };
    camStream.on('data', pipeStream);

    wsocket.on('disconnect', function() {
      console.log('disconnected from /cam' + i);
      camStream.removeListener('data', pipeStream);
    });
  });
});

io.on('connection', function(socket) {
 socket.emit('start', cams.length);
});

app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});