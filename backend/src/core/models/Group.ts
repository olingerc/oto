/*jslint node: true */

import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

/**
 * User Schema
 */
let GroupSchema = new Schema({
  id: {type: String, unique: true},
  title: {type: String, required: true},
  /*
  the selectable is used to determin whether a group can be
  selected by the user in the navbar.
  Most of the time it is true except for the groups that are at the same level
  than a lab. For example LNS.
  */
  selectable: {type: Boolean, default: true},
  lab: {type: Schema.Types.ObjectId, ref: 'Lab'},
}, { 'collection': 'system_groups' });

GroupSchema.index({ title: 1, lab: 1}, { unique: true });

GroupSchema.pre('save', function (next) {
  this.id = this._id;

  next();
});

mongoose.model('Group', GroupSchema);
