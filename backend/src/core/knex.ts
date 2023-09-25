/*jslint node: true */
import _knex from 'knex';
import * as knexfile from './knexfile';

import { configFunc } from '../config/config';
const config = configFunc();

const knexConfig = knexfile[config.nodeEnv];

const knex = {knex: _knex(knexConfig)};

export = knex;