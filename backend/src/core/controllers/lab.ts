/*jslint node: true */

import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import '../models/Lab';

let Lab = mongoose.model('Lab');


let lab: any = {
  list: function(req, res) {
    Lab.find({})
      .sort("title")
      .exec(
        function(err, labs) {
          res.status(200).json(labs);
        }
      );
  },
  create: function(req, res, next) {
    let lab = new Lab(req.body);
    let message = null;
    lab.save(function(err: any, lab) {
      if (err) {
        switch (err.code) {
          case 11000:
          case 11001:
            message = `Institute title taken: ${req.body.title}`;
            break;
          default:
            message = 'Please fill all the required fields';
          }
          res.status(400).json({success: false, message: message});
        } else {
          res.status(200).json(lab)
        };
    });
  },
  update: function(req, res, next) {
    let id = req.params.id;
    let lab = Lab.findOne({id: id}, function(err, lab) {
      if (err) {
        res.status(400).json({success: false, message: JSON.stringify(err)});
      } else {
        if (!lab) {
          return res.status(400).json({success: false, message: 'Failed finding lab ' + id});
        }
        let updatedLab = req.body;
        delete updatedLab.__v;

        // Do actual update
        _.extend(lab, updatedLab);

        lab.save(function(err, lab) {
          if (err) {
            res.status(400).json({success: false, message: JSON.stringify(err)});
          } else {
            res.status(200).json(lab);
          }
        });
      }
    });
  },
  remove: function(req, res, next) {
    Lab.deleteOne({id: req.params.id}, function(err) {
      if (err) {
        res.status(400).json({success: false, message: JSON.stringify(err)});
      } else {
        res.status(200).json({success: true, message: 'removed'});
      }
    });
  }
};

export = lab;
