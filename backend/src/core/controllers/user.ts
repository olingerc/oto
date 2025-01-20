/*jslint node: true */

import _ from 'lodash';
import crypto from 'crypto';

import { User } from '../models/User';

import * as Privileges from '../models/Privileges';
import * as auth from './auth';
import { configFunc } from '../../config/config';
const config = configFunc();

/**
 * INTENRAL USER FUNCTIONS
 */

/**
 * Make salt
 *
 * @return {String}
 * @api public
 */
function _makeSalt () {
  return crypto.randomBytes(16).toString('base64');
}

function _setPassword(password, userDoc) {
  userDoc.salt = _makeSalt();
  userDoc.hashed_password = auth.encryptPassword(password, userDoc);
  delete userDoc.password;
  return userDoc;
}

/**
 * Pre-save hook
 */
function _preSave(userDoc) {

  // UPDATE AND NEW
  // keep roles and privilges in sync
  let roles = [];
  let roleType = null;
  _.each(userDoc.privileges, (privKey) => {
    roleType = _.find(Privileges.types, {"key": privKey});
    if (roleType && roles.indexOf(roleType.role) == -1) {
      roles.push(roleType.role);
    }
  });
  userDoc.roles = roles;

  // save active Privileges based on active Role
  // if manager, keep user, if admin, keep manager and user
  let active_privileges = [];
  roleType = null;
  _.each(userDoc.privileges, (privKey) => {
    roleType = _.find(Privileges.types, {"key": privKey});
    if (roleType && roleType.role === userDoc.active_role) {
      active_privileges.push(roleType.key);
    }

    if (userDoc.active_role === "manager") {
      if (roleType && roleType.role === "user") {
        active_privileges.push(roleType.key);
      } 
    }

    if (userDoc.active_role === "admin") {
      if (roleType && (roleType.role === "user" || roleType.role === "manager")) {
        active_privileges.push(roleType.key);
      } 
    }
  });
  userDoc.active_privileges = active_privileges;
  return userDoc;
}

let methods: any = {
  list: async function(req, res) {
    try {
      const users = await User.query().orderBy("username");
      _.each(users, function(user, index) {
        user = auth.censor(user);
      });
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({"message": 'Error reading labs from db.'});
    }
  },

  create: async function(req, res, next) {
    if (!req.body.password) {
      req.body.password = req.body.username;
    }
    let userToCreate = req.body;

    // Non domain user
    userToCreate.default_password_changed = true;
    userToCreate = _setPassword(userToCreate.password, userToCreate);
    try {
      const savedUser = await User.query().insert(userToCreate);
      res.json(auth.censor(savedUser));
    } catch (e) {
      res.status(400).json({success: false, message: e});
    }
  },

  update: async function(req, res, next) {
    /**
    * This route can not be used to change or remove a password
    */
    let username = req.params.username;
    const userDoc = await User.query().where("username", username).first();
    
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    let toUpdate = req.body;
    delete toUpdate.password;

    // Patch
    Object.keys(toUpdate).forEach((key) => {
      userDoc[key] = toUpdate[key];
    });
    _preSave(userDoc);

    try {
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

  /*
  * by user
  */
  addPasswordByUser: async function(req, res, next) {
    let username = req.params.username;
    let userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    // this route can not be used to change or remove a password
    if (userDoc.default_password_changed) {
      return res.status(500).json({success: false, message: 'User ' + username + ' already changed their password.'});
    }

    if (req.body.password && req.body.password !== '') {
      userDoc = _setPassword(req.body.password, userDoc);
      userDoc.default_password_changed = true;
    } else {
      return res.status(500).json({success: false, message: 'No password was provided.'});
    }
    try {
      userDoc = _preSave(userDoc);
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

  changePasswordByUser: async function(req, res, next) {
    if (!req.body.old) {
      return res.status(400).json({success: false, message: 'Password is required'});
    }
    let username = req.params.username;
    let userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    let oldPassword = req.body.old;
    if (!auth.authenticate(oldPassword, userDoc)) {
      return res.status(401).json({success: false, message: 'incorrect password'});
    }

    if (req.body.new) {
      userDoc = _setPassword(req.body.new, userDoc);
      userDoc.default_password_changed = true;
    }
    try {
      userDoc = _preSave(userDoc);
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

  removePasswordByAdmin: async function(req, res, next) {
    let username = req.params.username;
    let userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    userDoc = _setPassword(userDoc.username, userDoc);
    userDoc.default_password_changed = false;

    try {
      userDoc = _preSave(userDoc);
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

  changeActiveRole: async function(req, res, next) {
    let username = req.params.username;
    let role = req.body.role;

    let userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    userDoc.active_role = role;
    try {
      userDoc = _preSave(userDoc);
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

  removeWithPassword: async function(req, res, next) {
    if (!req.body.old) {
      return res.status(400).json({success: false, message: 'Password is required'});
    }
    let username = req.params.username;
    const userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    let password = req.body.old || 'default';

    if (!auth.authenticate(password, userDoc)) {
      return res.status(401).json({success: false, message: 'incorrect password'});
    }

    try {
      const _delete = await User.query().where("username", username).delete();
      res.status(200).json({success: true, message: 'removed'});
    } catch (delerr) {
      res.status(400).json({success: false, message: JSON.stringify(delerr)});
    }
  },

  remove: async function(req, res, next) {
    try {
      const _delete = await User.query().where("username", req.params.username).delete();
      res.status(200).json({success: true, message: 'removed'});
    } catch (delerr) {
      res.status(400).json({success: false, message: JSON.stringify(delerr)});
    }
  },

  checkAdminMinimum: async function() {
    if (config.debug == "true") {
      const userDoc: any = await User.query().where("username", "su").first();
      // super user is only to facilitate development. this user has all privileges
      if (!userDoc) {
        let suUser = {
          username: 'su',
          fullname: 'Superuser',
          active_role: 'admin',
          default_password_changed: true,
          privileges: Privileges.keys
        };
        suUser = _setPassword("123", suUser);
        suUser = _preSave(suUser);
        const savedUser: any = await User.query().insert(suUser);
        console.log('An initial superuser has been created: su/123');
      }
    }

    const userDoc: any = await User.query().where("username", "admin").first();
    if (!userDoc) {
      let adminUser = {
        username: 'admin',
        fullname: 'Administrator',
        active_role: 'admin',
        default_password_changed: true,
        privileges: ["otoUser", "otoAdmin"]
      };
      adminUser = _setPassword("123", adminUser);
      adminUser = _preSave(adminUser);
      const savedUser: any = await User.query().insert(adminUser);
      console.log('An initial admin has been created: admin/123');
    }
  },

  removeTasksApiToken: async function(req, res, next) {
    let username = req.params.username;
    let userDoc: any = await User.query().where("username", username).first();
    if (!userDoc) {
      return res.status(400).json({success: false, message: 'Failed finding user ' + username});
    }

    userDoc.tasksapitoken = null;
    try {
      userDoc = _preSave(userDoc);
      const updatedUser = await User.query()
        .findById(username)
        .patch(userDoc)
        .returning('*')
        .first();
      res.status(200).json(auth.censor(updatedUser));
    } catch (e) {
      res.status(400).json({success: false, message: JSON.stringify(e)});
    }
  },

};

export = methods;
