/*jslint node: true */

import _ from 'lodash';
import jwt from 'jsonwebtoken';

import * as Privileges from './models/Privileges';
import { configFunc } from '../config/config';

let config = configFunc();

/**
 * Routes with accessLevel (not public) will get verified
 * First the presence of a valid token (in case not anon)
 * (the token alone only checks that a valid user is logged in)
 * Then if the user has the necessary privileges
 * If the route has no privileges, then we will let everybody through
 */
let secureRouting = function(app, routes) {

  /**
   * First test jwt token validity
   */
  function verifyToken(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, config.superSecret, function(err, decodedPayload) {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res
              .status(401)
              .json({ success: false, message: 'Your login has expired. Please login again.' })
              .end();
          } else {
            return res
              .status(403)
              .json({ success: false, message: 'Failed to authenticate token.' })
              .end();
          }
        } else {
          // if everything is good, save to request for use in other routes
          req.user = decodedPayload;
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res
        .status(401)
        .json({success: false, message: 'No token provided.'})
        .end();
    }
  }

  /**
   * Similar to authentication service on client
   * user role is saved in jwt token.
   */
  function verifyAccessRights(req, res, next) {

    let route: any = _.find(routes, { path: req.route.path, httpMethod: req.method.toUpperCase() });

    // by default everybody is welcome
    let accessLevel = route.accessLevel || 'public';
    let accessPrivileges = route.accessPrivileges || [];

    // let public through
    if (accessLevel === 'public') {
      return next();
    }

    // this means we need to check privileges

    // get user role
    // TODO: get a new User here in case of hack attempt

    // let anon through if no user
    // if not anon and no user, ERROR
    let user = req.user;
    if (!user) {
      if (accessLevel === 'anon') {
        return next();
      } else {
        return res
          .status(403)
          .json({sucess: false, message: `"Valid user could not be found in request`})
          .end();
        }
    }

    // Admin privileges get free pas
    if (user.privileges && user.privileges.indexOf("otoAdmin") > -1) {
      return next();
    }

    // We have a user and accessLevel user, check privileges if necessary
    // Default is to let through
    if (accessPrivileges.length === 0) {
      return next();
    }

    // Check that we know that privilege
    let unknownPrivileges = _.difference(accessPrivileges, Privileges.keys);
    if (unknownPrivileges.length > 0) {
      res
        .status(500)
        .json({
          sucess: false,
          message: `"${unknownPrivileges.join(',')}" not kown to server`
        })
        .end();
    }
    // Do we know that privilege ?

    let grantAccess = false;
    _.each(accessPrivileges, function(privilege) {
      if (user.privileges.indexOf(privilege) >= 0) {
        grantAccess = true;
      }
    });
    if (grantAccess) {
      return next();
    } else {
      res
        .status(403)
        .json({
          sucess: false,
          message: `"${accessPrivileges.join(' or ')}" privileges are needed to access ${route.path}`
        })
        .end();
    }
  }

  _.each(routes, function(route) {

    // Add verification to middlewares if login is needed
    if (route.accessLevel && route.accessLevel !== 'public') {
      route.middleware.unshift(verifyAccessRights); // 2nd place
      if (route.accessLevel !== 'anon') {
        route.middleware.unshift(verifyToken); // 1st place
      }
    }

    let args = _.flatten([route.path, route.middleware]);
    switch(route.httpMethod.toUpperCase()) {
      case 'GET':
        app.get.apply(app, args);
        break;
      case 'POST':
        app.post.apply(app, args);
        break;
      case 'PUT':
        app.put.apply(app, args);
        break;
      case 'DELETE':
        app.delete.apply(app, args);
        break;
      default:
        throw new Error('Invalid HTTP method specified for route ' + route.path);
      }
    }
  );
};

export = secureRouting;
