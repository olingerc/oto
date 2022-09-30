/*jslint node: true */

/**
 * Identical to same model class on client
 * Client has more details
 */
import * as _ from 'lodash';

let privilegeTypes = [
  {"role": "user", "module": "oto", "key": "otoUser"},
  {"role": "user", "module": "cams", "key": "camsUser"},
  {"role": "user", "module": "printer", "key": "printerUser"},

  {"role": "admin", "module": "dev", "key": "devAdmin"},
  {"role": "admin", "module": "oto", "key": "otoAdmin"},
];

let privileges = {
  types: privilegeTypes,
  keys: _.map(privilegeTypes, "key")
};

export = privileges;
