/*jslint node: true */

import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import '../models/Group';

let Group = mongoose.model('Group');


let group: any = {
  list: function(req, res) {
    let labTitle = req.query.labtitle;
    Group.find({})
      .populate('lab')
      .sort("title")
      .exec(
        function(err, groups) {
          if (labTitle) {
            // I could do two nested queries to look first for all
            // labs mathich labTitle and then retrieve all groups that have that
            // lab, but this is a rare use case so I simply filter with javascript
            groups = _.filter(groups, function(group) {
              return group.lab && group.lab.title === labTitle;
            });
          }
          res.status(200).json(groups);
        }
      );
  },
  create: function(req, res, next) {
    let group = new Group(req.body);
    let message = null;
    group.save(function(err: any, group) {
      if (err) {
        switch (err.code) {
          case 11000:
          case 11001:
            message = `Group title taken: ${req.body.title}`;
            break;
          default:
            message = 'Please fill all the required fields';
          }
          res.status(400).json({success: false, message: message});
        } else {
          res.status(200).json(group)
        };
    });
  },
  update: function(req, res, next) {
    let id = req.params.id;
    let group = Group.findOne({id: id}, function(err, group) {
      if (err) {
        res.status(400).json({success: false, message: JSON.stringify(err)});
      } else {
        if (!group) {
          return res.status(400).json({success: false, message: 'Failed finding group ' + id});
        }
        let updatedGroup = req.body;
        delete updatedGroup.__v;

        // Do actual update
        _.extend(group, updatedGroup);

        group.save(function(err, group) {
          if (err) {
            res.status(400).json({success: false, message: JSON.stringify(err)});
          } else {
            res.status(200).json(group);
          }
        });
      }
    });
  },
  remove: function(req, res, next) {
    Group.deleteOne({id: req.params.id}, function(err) {
      if (err) {
        res.status(400).json({success: false, message: JSON.stringify(err)});
      } else {
        res.status(200).json({success: true, message: 'removed'});
      }
    });
  },
  createSystemGroup: function(req, res) {
    Group.findOne({'title': 'System'}, function(err, group) {
      if (err) {
        console.log(err);
      }
      if (!group) {
        let systemGroup = new Group({
          title: 'System',
          selectable: false
        });
        systemGroup.save(function(err) {
          if (err) {
            console.log('Error while trying to create system group');
            console.log(err);
          }
        });
      }
    });
  }
};

export = group;
