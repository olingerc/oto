/*jslint node: true */

/**
 * Only resources and lab module are currently managed by knex on the backend side
 * All others are managed on tasks side via sqlalchemy
 */

import { configFunc } from '../config/config';

const config = configFunc();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : config.pgHost,
      port : config.pgPort,
      user : config.pgUser,
      password : config.pgPw,
      database : config.pgDB
    }
  },
  production: {
    client: 'pg',
    connection: {
      host : config.pgHost,
      port : config.pgPort,
      user : config.pgUser,
      password : config.pgPw,
      database : config.pgDB
    }
  }
}