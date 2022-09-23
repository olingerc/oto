/*jslint node: true */

import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';
import  _ from 'lodash';

import * as Privileges from './Privileges';

/**
 * User Schema
 */

export interface IUser extends Document {
  id: string,
  username: string,
  created: Date,
  domainLogin: Boolean,
  last_login: Date,
  fullname: string,
  email: string,
  lastActiveGroupId: string,
  groups: Object[],
  role: string,
  privileges: string[],
  limsPrivileges: string[],
  activePrivileges: string[],
  roles: string[],
  activeRole: string,
  salt: string,
  hashed_password: string,
  defaultPasswordChanged: Object,

  password: string,
  tasksApiToken: string,
  tasksApiTokenSet: boolean,

  authenticate(password: string): boolean,
  censor(): IUser,
  makeSalt(): string,
  encryptPassword(password: string): string
}

const UserSchema: Schema = new Schema({
  id: {type: String, unique: true},
  username: {type: String, unique: true},
  created: Date,
  domainLogin: Boolean,
  last_login: Date,
  fullname: String,
  email: String,
  salt: {type: String },
  hashed_password: {type: String },
  tasksApiToken: String,
  lastActiveGroupId: String,
  groups: [{type: Schema.Types.ObjectId, ref: 'Group'}],

  role: String, // 'admin', 'user' TODO: phase out

  privileges: {type: [String], default: ["otoUser"]},
  limsPrivileges: {type: [String]},
  activePrivileges: {type: [String], default: ["otoUser"]},

  roles: {type: [String], default: ["user"]},
  activeRole: {type: String, default: "user"},
  defaultPasswordChanged: { type: Boolean, default: false }

}, { 'collection': 'system_users' });

// Ensure virtual fields are serialised.
UserSchema.set('toJSON', {
  virtuals: true
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.encryptPassword(password);
}).get(function() {
  return this._password;
});

UserSchema.virtual('tasksApiTokenSet').get(function() {
  return this.tasksApiToken !== null;
});

/**
 * Validations
 */
let validatePresenceOf = function(value) {
  return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('fullname').validate(function(fullname) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (!this.provider) return true;
  return (typeof fullname === 'string' && fullname.length > 0);
}, 'Fullname cannot be blank');

UserSchema.path('email').validate(function(email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (!this.provider) return true;
  return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (!this.provider) return true;
  return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (!this.provider) return true;
  return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre<IUser>('save', function(next) {

  // UPDATE AND NEW
  // keep roles and privilges in sync
  let roles = [];
  let roleType = null;
  _.each(this.privileges, (privKey) => {
    roleType = _.find(Privileges.types, {"key": privKey});
    if (roleType && roles.indexOf(roleType.role) == -1) {
      roles.push(roleType.role);
    }
  });
  this.roles = roles;

  // save active Privileges based on active Role
  // if manager, keep user, if admin, keep manager and user
  let activePrivileges = [];
  roleType = null;
  _.each(this.privileges, (privKey) => {
    roleType = _.find(Privileges.types, {"key": privKey});
    if (roleType && roleType.role === this.activeRole) {
      activePrivileges.push(roleType.key);
    }

    if (this.activeRole === "manager") {
      if (roleType && roleType.role === "user") {
        activePrivileges.push(roleType.key);
      } 
    }

    if (this.activeRole === "admin") {
      if (roleType && (roleType.role === "user" || roleType.role === "manager")) {
        activePrivileges.push(roleType.key);
      } 
    }
  });
  this.activePrivileges = activePrivileges;

  if (!this.isNew) {
    return next();
  }

  // ONLY NEW
  this.id = this._id;
  this.created = this.created || new Date;
  this.last_login = this.last_login || new Date;

  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});


/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    let _this = this as IUser;
    return _this.encryptPassword(plainText) === _this.hashed_password;
  },

  /**
   * Censor - remove sensitive data from user
   *
   * @return {User}
   * @api public
   */
  censor: function(this: IUser) {
    if (this.hashed_password) this.hashed_password = undefined;
    if (this.salt) this.salt = undefined;
    if (this.tasksApiToken) this.tasksApiToken = undefined;
    return this;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    let _this = this as IUser;
    if (!password || !_this.salt) return '';
    let salt = Buffer.from(_this.salt, 'base64');
    return crypto.pbkdf2Sync(
      password,
      salt,
      10000,
      64,
      'sha1'
    )
    .toString('base64');
  },
};

export default mongoose.model<IUser>('User', UserSchema);
