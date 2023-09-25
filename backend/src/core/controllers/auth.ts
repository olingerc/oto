/*jslint node: true */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { User } from '../models/User';
import { configFunc } from '../../config/config';

const config = configFunc();

/**
 * Censor - remove sensitive data from user
 *
 * @return {User}
 * @api public
 */
function _censor(userDoc) {
  if (userDoc.hashed_password) userDoc.hashed_password = undefined;
  
  if (userDoc.salt) userDoc.salt = undefined;
  
  userDoc.tasksapitokenSet = false;
  if (userDoc.tasksapitoken) {
    userDoc.tasksapitoken = undefined;
    userDoc.tasksapitokenSet = true;
  };
  delete userDoc.tasksapitoken;
  return userDoc;
}

/**
 * Encrypt password
 *
 * @param {String} password
 * @return {String}
 * @api public
 */
function _encryptPassword(password, userDoc) {
  if (!password || !userDoc.salt) return '';
  let salt = Buffer.from(userDoc.salt, 'base64');
  return crypto.pbkdf2Sync(
    password,
    salt,
    10000,
    64,
    'sha1'
  )
  .toString('base64');
}

/**
 * Authenticate - check if the passwords are the same
 *
 * @param {String} plainText
 * @return {Boolean}
 * @api public
 */
function _authenticate(plainText, userDoc) {
  return _encryptPassword(plainText, userDoc) === userDoc.hashed_password;
}

async function _success(userDoc: any, req, res) {
  let updatedUser: any = await User.query()
    .where("username", userDoc.username)
    .patch({ last_login: new Date() })
    .returning("*")
    .first()
    ;

  // remove sensitive info
  updatedUser = _censor(updatedUser);

  // tasks jwt expect user to be in an additional "user_claims" key
  updatedUser.user_claims = {
    username: updatedUser.username,
    fullname: updatedUser.fullname,
    active_role: updatedUser.active_role,
    active_privileges: updatedUser.active_privileges,
    privileges: updatedUser.privileges,
    email: updatedUser.email
  };

  // if password is right create a token (24 h)
  updatedUser.token = jwt.sign(
    updatedUser.toJSON(),
    config.superSecret,
    { expiresIn: 60*60*24 }
  );

  // Done
  res.status(200).json(updatedUser);
}

/**
 * Authentication methods
 */

let auth: any = {
  encryptPassword: _encryptPassword,
  censor: _censor,
  authenticate: _authenticate,

  // just a way to test if token still valid
  // the secureRouting will test token before going to this route
  ping: function(req, res, next) {
    res.status(200).json({message: 'pong'});
  },

  login: async function(req, res, next) {

    try {
      const userDoc: any = await User.query()
        .where("username", req.body.username)
        .first();
      if (!userDoc) {
        res.status(400).json({ success: true, message: 'Username or password incorrect' });
      } else {

          // local login
          if (!_authenticate(req.body.password, userDoc)) {
            res.status(401).json({ success: false, message: 'Username or password incorrect' });
          } else {
            const _done = await _success(userDoc, req, res);
          }
      }
    } catch (e) {
      throw e;
    }
  }
};

export = auth;
