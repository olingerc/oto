/*jslint node: true */
import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';

import socketio from "socket.io";
import rtsp from 'rtsp-ffmpeg';

import http from 'http';
import _ from 'lodash';
import cors from  'cors';
import compression from 'compression';

import { configFunc } from './config/config';

import * as User_Ctrl from './core/controllers/user';

// Routes
import { routes as coreCroutes } from './core/coreRoutes';
import { routes as printerRoutes } from './api/routes';

/**
 * Define environment. Should be pre-set via grunt already or in commandline!
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize system variables (make sure variables in -env files are set. usually via dockker)
let config = configFunc();

// Configure mongoose connection
mongoose
  .connect(config.db, {})
  .then(() => {
    return console.info(`Successfully connected to mongodb`);
  })
  .catch(error => {
    console.error('Error connecting to database: ', error);
    return process.exit(1);
  });
mongoose.connection.on('error', console.error.bind(console, 'ERROR: Failed connecting to mongodb:'));

/**
 * Configure express settings
 */
let app = module.exports = express();
app.disable('x-powered-by');

app.locals.pretty = true;

if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

/**
 * Define paths
 */
app.use(express.urlencoded({limit: '50mb', extended: true}))
app.use(express.json({limit: '50mb'}))

/**
 * AUTHENTICATION
 */
// make sure at least one admin user exists
User_Ctrl.checkAdminMinimum();

/**
 * CORS
 */
let corsOptions = { "origin": config.backendAllowedOrigins };
app.use(cors(corsOptions));

/**
 * DEFINE ROUTES
 */

let routes = [];
// Core route: authentication api
routes = routes.concat(coreCroutes);

// Add module API ROUTES (plugin entry point, just add routes to this array)

routes = routes.concat(printerRoutes);

// Clean up routes
routes = _.uniq(routes);

// Secure routes with JWT and accessLevels
require('./core/secureRouting')(app, routes);

/**
 * Catch all error handlers (they have 4 arguments)
 */

// log errors to stdout
function logErrors (err, req, res, next) {
 console.error(err.stack);
 next(err);
}
// catch xhr calls
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    console.error('XHR call failed!');
    res.status(500).send({ error: 'XHR call failed!' });
  } else {
    next(err);
  }
}

// catch all the rest
function errorHandler (err, req, res, next) {
  console.error('(Caught by final error handler)');
  console.error(err.message);
  res.status(500).send({ error: "(Caught by final error handler) " + err.message });
}

/**
 * 404
 */
function handle404(req, res, next){
  res.status(404);

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Url does not exist on this server' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
}

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
app.use(handle404);
// ^^^ This is the final handler

/**
 * Configure Server
 */
app.set('port', process.env.PORT || config.port);
const server = http.createServer(app);

/** SOCKET */
const io = new socketio.Server(server,{
  path: "/camssocket",
  cors: {
    origin: "*",
    credentials: false,
  }
});
io.on("connection", function (socket) {
  console.log("Made socket connection");
});

/** CAMS */
const camUser = fs.readFileSync("/run/secrets/CAM_USER").toString().trim();
const camPw = fs.readFileSync("/run/secrets/CAM_PW").toString().trim();

const myCam = `rtsp://${camUser}:${camPw}@192.168.178.88:554/h264Preview_01_main`;
const myCam2 = `rtsp://${camUser}:${camPw}@192.168.178.90:554/h264Preview_01_main`;
/* Setup stream */
var stream = new rtsp.FFMpeg({input: myCam, resolution: '640x360', quality: 3});
stream.on('start', function() {
	console.log('stream started');
});
stream.on('stop', function() {
	console.log('stream stopped');
});
var stream2 = new rtsp.FFMpeg({input: myCam2, resolution: '640x360', quality: 3});
stream2.on('start', function() {
	console.log('stream 2 started');
});
stream2.on('stop', function() {
	console.log('stream 2 stopped');
});

/* Connect stream to socket */
var namespace = io.of('/cam0');
namespace.on('connection', function(wsocket) {
	console.log('connected to /cam0');
	var pipeStream = function(data) {
		wsocket.emit('data', data);
	};
  stream.removeListener('data', pipeStream);
	stream.on('data', pipeStream);

	wsocket.on('disconnect', function() {
		console.log('disconnected from /cam0');
		stream.removeListener('data', pipeStream);
	});
});
/* Connect stream to socket */
var namespace2 = io.of('/cam1');
namespace2.on('connection', function(wsocket) {
	console.log('connected to /cam1');
	var pipeStream = function(data) {
		wsocket.emit('data', data);
	};
  stream2.removeListener('data', pipeStream);
	stream2.on('data', pipeStream);

	wsocket.on('disconnect', function() {
		console.log('disconnected from /cam1');
		stream2.removeListener('data', pipeStream);
	});
});

/**
 * Start server
 */
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
