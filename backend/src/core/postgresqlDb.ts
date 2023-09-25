/*jslint node: true */

import pg from 'pg';

import { configFunc } from '../config/config';

const config = configFunc();

let pgConfig = {
  user: config.pgUser,
  database: config.pgDB,
  password: config.pgPw,
  host: config.pgHost,
  port: config.pgPort,
  idleTimeoutMillis: 30000,
  application_name: "velona"
};

// HACK:
/*
I had this issue in production: https://github.com/brianc/node-postgres/issues/2112
So I switched from Pool to Client
*/

const pool = new pg.Pool(pgConfig);

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error');
  console.error(err);
});

let query = function (text, values, callback) {
  return pool.query(text, values, callback);
};

// the pool also supports checking out a client for
// multiple operations, such as a transaction
let connect = function (callback) {
  return pool.connect(callback);
};

let _export = {query: query, pool: pool, connect: connect};

export = _export;
