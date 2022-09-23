/*jslint node: true */

import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

/**
 * User Schema
 */
let LabSchema = new Schema({
  id: {type: String, unique: true},
  title: {type: String, unique: true}
}, { 'collection': 'system_institutes' });

LabSchema.pre('save', function (next) {
  this.id = this._id;

  next();
});

mongoose.model('Lab', LabSchema);
