/*jslint node: true */

/**
 * Identical to same model class on client
 * Client has more details
 */
import * as _ from 'lodash';

let privilegeTypes = [
  {"role": "user", "module": "velona", "key": "otoUser"},
  {"role": "user", "module": "tools", "key": "toolsUser"},
  {"role": "user", "module": "lims", "key": "limsUser"},
  {"role": "user", "module": "genseqhub", "key": "genseqhubUser"},
  {"role": "user", "module": "bioinf", "key": "bioinfUser"},
  {"role": "user", "module": "bioinf start wgs", "key": "bioinfWgs"},
  {"role": "user", "module": "resources", "key": "resourcesUser"},
  {"role": "user", "module": "luxgenIncoming", "key": "luxgenIncomingUser"},
  {"role": "user", "module": "luxgenSeq", "key": "luxgenSeqUser"},
  {"role": "user", "module": "luxgen start pipelines", "key": "luxgenStartPipelinesUser"},
  {"role": "user", "module": "luxgen transfer", "key": "luxgenTransferUser"},
  {"role": "user", "module": "luxgenReads", "key": "luxgenReadsUser"},
  {"role": "user", "module": "luxgenPreps", "key": "luxgenPrepsUser"},
  {"role": "user", "module": "variants", "key": "variantsUser"},
  {"role": "user", "module": "veriseq", "key": "veriseqUser"},

  {"role": "manager", "module": "luxgen", "key": "luxgenManager"},
  {"role": "manager", "module": "bioinf", "key": "bioinfManager"},
  {"role": "manager", "module": "veriseq", "key": "veriseqManager"},
  {"role": "manager", "module": "bioinf", "key": "bioinfManageFiltersets"},
  {"role": "manager", "module": "variants", "key": "variantsManager"},

  {"role": "admin", "module": "lims", "key": "limsAdmin"},
  {"role": "admin", "module": "dev", "key": "devAdmin"},
  {"role": "admin", "module": "velona", "key": "otoAdmin"},
  {"role": "admin", "module": "genseqhub", "key": "genseqhubAdmin"},
  {"role": "admin", "module": "bioinf", "key": "bioinfAdmin"},
  {"role": "admin", "module": "resources", "key": "resourcesAdmin"},
  {"role": "admin", "module": "luxgen", "key": "luxgenAdmin"},

];

let privileges = {
  types: privilegeTypes,
  keys: _.map(privilegeTypes, "key")
};

export = privileges;
