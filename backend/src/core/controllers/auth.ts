/*jslint node: true */

import jwt from 'jsonwebtoken';

import User, { IUser } from '../models/User';
import { configFunc } from '../../config/config';

const config = configFunc();

function _success(user: any, req, res) {
  const now = new Date()
  user.last_login = now;
  User.findByIdAndUpdate(
    user.id,
    { last_login: now },
    null,
    function(err, updatedUser) {}
  );

  // remove sensitive info
  user = user.censor().toObject();

  // tasks jwt expect user to be in an additional "user_claims" key
  user.user_claims = {
    username: user.username,
    fullname: user.fullname,
    activeRole: user.activeRole,
    activePrivileges: user.activePrivileges,
    groups: user.groups,
    privileges: user.privileges,
    lastActiveGroupId: user.lastActiveGroupId,
    email: user.email
  };

  // if password is right create a token (24 h)
  user.token = jwt.sign(
    user,
    config.superSecret,
    { expiresIn: 60*60*24 }
  );

  // switch id
  user.id = user._id;
  delete user._id; // TODO not sexy but it works

  // Done
  res.status(200).json(user);
}

/**
 * Authentication methods
 */

let auth: any = {
  // just a way to test if token still valid
  // the secureRouting will test token before going to this route
  ping: function(req, res, next) {
    res.status(200).json({message: 'pong'});
  },

  login: function(req, res, next) {

    // find the user
    User
      .findOne({username: req.body.username})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) throw err;

        if (!user) {
          res.status(400).json({ success: true, message: 'Username or password incorrect' });
        } else if (user) {

          // local login
          if (!user.authenticate(req.body.password)) {
            res.status(401).json({ success: false, message: 'Username or password incorrect' });
          } else {
            _success(user, req, res);
          }
        }
      }
    );
  }
};

export = auth;
