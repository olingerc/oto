/*jslint node: true */

import _ from 'lodash';

import User, { IUser } from '../models/User';

import * as Privileges from '../models/Privileges';
import { configFunc } from '../../config/config';
const config = configFunc();

let methods: any = {
  list: function(req, res) {
    User.find({})
      .populate({path: "groups", populate: {path: "lab"}})
      .sort('username')
      .exec(
        function(err, users) {
          _.each(users, function(user, index) {
            user.censor();
          });
        res.status(200).json(users);
      }
    );
  },
  create: function(req, res, next) {
    /*try { //TODO: validate using model requirements
        User.validate(req.body);
    }
    catch(err) {
        return res.send(400, err.message);
    }*/
    if (!req.body.password) {
      req.body.password = req.body.username;
    }
    let user = new User(req.body);
    let message = null;

    user.save(function(err: any, user) {
      if (err) {
        switch (err.code) {
          case 11000:
          case 11001:
            message = `Username already taken: ${req.body.username}`;
            break;
          default:
            message = 'Please fill all the required fields';
          }
          res.status(400).json({success: false, message: message});
        } else {
          res.status(200).json(user.censor())
        };
    });
  },
  update: function(req, res, next) {
    /**
    * This route can not be used to change or remove a password
    */
    let id = req.params.id;
    User
      .findOne({id: id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }
          let updatedUser = req.body;
          delete updatedUser.__v;

          // Do not save any passwords, keep passowrd encrypted in DB
          delete user.password;
          delete updatedUser.password;

          // Do actual update
          _.extend(user, updatedUser);

          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },

  /*
  * by user
  */
  addPasswordByUser: function(req, res, next) {
    /*try { //TODO:  validate
        User.validate(req.body);
    }
    catch(err) {
        return res.send(400, err.message);
    }*/
    let id = req.params.id;
    User
      .findOne({id: id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }

          // this route can not be used to change or remove a password
          if (user.defaultPasswordChanged) {
            return res.status(500).json({success: false, message: 'User ' + id + ' already changed her password.'});
          }

          if (req.body.password && req.body.password !== '') {
            user.password = req.body.password;
            user.defaultPasswordChanged = true;
          } else {
            return res.status(500).json({success: false, message: 'No password was provided.'});
          }
          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            }
            else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },
  changePasswordByUser: function(req, res, next) {
    if (!req.body.old) {
      return res.status(400).json({success: false, message: 'Password is required'});
    }
    let id = req.params.id;
    User
      .findOne({id: id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }
          let oldPassword = req.body.old;
          if (!user.authenticate(oldPassword)) {
            return res.status(401).json({success: false, message: 'incorrect password'});
          }

          if (req.body.new) {
            user.defaultPasswordChanged = true;
            user.password = req.body.new;
          }
          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },
  removePasswordByAdmin: function(req, res, next) {
    let id = req.params.id;
    let user = User
      .findOne({id: id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }

          user.defaultPasswordChanged = false;
          user.password = user.username;

          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },
  changeActiveGroup: function(req, res, next) {
    let id = req.params.id;
    let groupId = req.body.groupId;
    let user = User
      .findOne({id:id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }
          user.lastActiveGroupId = groupId;

          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },
  changeActiveRole: function(req, res, next) {
    let id = req.params.id;
    let role = req.body.role;
    let user = User
      .findOne({id:id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }
          user.activeRole = role;

          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },
  removeWithPassword: function(req, res, next) {
    if (!req.body.old) {
      return res.status(400).json({success: false, message: 'Password is required'});
    }
    let id = req.params.id;
    User
      .findOne({id:id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }
          let password = req.body.old || 'default';


          if (!user.authenticate(password)) {
            return res.status(401).json({success: false, message: 'incorrect password'});
          }

          User.findByIdAndDelete(user.id, null, function(err) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json({success: true, message: 'removed'});
            }
          });
        }
      }
    );
  },
  remove: function(req, res, next) {
    User.deleteOne({id: req.params.id}, function(err) {
      if (err) {
        res.status(400).json({success: false, message: JSON.stringify(err)});
      } else {
        res.status(200).json({success: true, message: 'removed'});
      }
    });
  },
  checkAdminMinimum: function() {
    if (config.debug == "true") {
      // super user is only to facilitate development. this user has all privilges
      User.findOne({'username': 'su'}, function(err, user) {
        if (err) {
          console.log(err);
        }
        if (!user) {
          let secondUser = new User({
            username: 'su',
            password: '123',
            fullname: 'Superuser',
            activeRole: 'admin',
            defaultPasswordChanged: true,
            privileges: Privileges.keys
          });
          secondUser.save(function(err) {
            if (err) {
              console.log('Error while trying to create initial su user');
              console.log(err);
            }
          });
          console.log('An initial superuser has been created: su/123');
        }
      });
    }
    User.findOne({'username': 'admin'}, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (!user) {
        let firstUser = new User({
          username: 'admin',
          password: '123',
          fullname: 'Administrator',
          activeRole: 'admin',
          defaultPasswordChanged: true,
          privileges: ["otoUser", "otoAdmin"]
        });
        firstUser.save(function(err) {
          if (err) {
            console.log('Error while trying to create initial admin user');
            console.log(err);
          }
        });
        console.log('An initial admin user has been created: admin/123');
      }
    });
  },
  removeTasksApiToken: function(req, res, next) {
    let id = req.params.id;
    let user = User
      .findOne({id: id})
      .populate({path: "groups", populate: {path: "lab"}})
      .exec(function(err, user) {
        if (err) {
          res.status(400).json({success: false, message: JSON.stringify(err)});
        } else {
          if (!user) {
            return res.status(400).json({success: false, message: 'Failed finding user ' + id});
          }

          user.tasksApiToken = null;
          user.save(function(err, user) {
            if (err) {
              res.status(400).json({success: false, message: JSON.stringify(err)});
            } else {
              res.status(200).json(user.censor());
            }
          });
        }
      }
    );
  },

};

export = methods;
