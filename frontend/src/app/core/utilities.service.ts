import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';

import { EnvService } from "../core/env/env.service";

@Injectable({
  "providedIn": "root"
})
export class UtilitiesService {

  constructor(private env: EnvService) {}

  static a2hex(str) {
    const arr = [];
    for (let i = 0, l = str.length; i < l; i++) {
      let hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  }

  static toUTCDate(date) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
  }

  makeId(length) {
    // in python: os.urandom(16).encode('hex')
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(
        Math.floor(Math.random() * possible.length)
      );
    }

    return UtilitiesService.a2hex(text);
  }

  getDateNoTime(date) {
    let d = null;
    if (!date) {
      d = new Date();
    } else {
      d = new Date(date);
    }
    let currDate = d.getDate();
    let currMonth = d.getMonth() + 1;
    let currYear = d.getFullYear();
    let currHour = d.getHours();
    let currMin = d.getMinutes();

    if (currDate < 10) {
      currDate = '0' + currDate;
    }
    if (currMonth < 10) {
      currMonth = '0' + currMonth;
    }
    if (currHour < 10) {
      currHour = '0' + currHour;
    }
    if (currMin < 10) {
      currMin = '0' + currMin;
    }

    return currYear + '-' +
      currMonth + '-' +
      currDate;
    // + " " + currHour + ":" + currMin + ":00";
  }

  getDateWithTime(date) {
    let d = null;
    if (!date) {
      d = new Date();
    } else {
      d = new Date(date);
    }
    let currDate = d.getDate();
    let currMonth = d.getMonth() + 1;
    let currYear = d.getFullYear();
    let currHour = d.getHours();
    let currMin = d.getMinutes();
    let currSec = d.getSeconds();

    if (currDate < 10) {
      currDate = '0' + currDate;
    }
    if (currMonth < 10) {
      currMonth = '0' + currMonth;
    }
    if (currHour < 10) {
      currHour = '0' + currHour;
    }
    if (currMin < 10) {
      currMin = '0' + currMin;
    }

    return currYear + '-' + currMonth + '-' + currDate + 'T' + currHour + ':' + currMin + ':' + currSec;
  }

  timeDifference(start, end) {
    if (!start || !end) {
      return "";
    }

    let diffInSeconds: Number = moment(end).diff(moment(start), 's');

    if (diffInSeconds > 60) {
      return moment(end).diff(moment(start), 'm') + ' m';
    }
    if (diffInSeconds > 3600) {
      return moment(end).diff(moment(start), 'h') + ' h';
    }

    return parseFloat((diffInSeconds as any)).toFixed(0) + ' s';
  }

  updateCollectionExisting(newCollection, collectionToUpdate, watch, uniqueAttribute) {
    /*
    Only update things that are in existing.
    If not there, ignore
    */
    if (!newCollection || newCollection.length === 0 || collectionToUpdate.length === 0) {
      return;
    }

    // Update visible changes and those that should appear when logging
    let oldCollectionUniques = _.map(collectionToUpdate, uniqueAttribute);
    _.each(newCollection, function(obj) {
      const corresponding = _.find(collectionToUpdate, function(c) {
        return c[uniqueAttribute] === obj[uniqueAttribute];
      });
      if (corresponding) {
        // Already on page, update only visible things
        _.each(watch, function(attribute) {
          //if (corresponding[attribute] !== obj[attribute]) {
            corresponding[attribute] = obj[attribute];
          //}
        });
        // Remove from oldCollectionUniques since it has been checked
        oldCollectionUniques = _.without(oldCollectionUniques, corresponding[uniqueAttribute]);
      }
    });
  }

  updateCollectionFromNew(newCollection, collectionToUpdate, watch, uniqueAttribute,
    skipProperty = null, skipValue = null) {
    if (collectionToUpdate.length === 0 && (newCollection && newCollection.length > 0)) {
      Array.prototype.push.apply(collectionToUpdate, newCollection);
      return;
    }
    if (!newCollection || newCollection.length === 0) {
      collectionToUpdate.length = 0;
      return;
    }
    // Update visible changes and those that should appear when logging
    let oldCollectionUniques = _.map(collectionToUpdate, uniqueAttribute);
    _.each(newCollection, function(obj) {
      const corresponding = _.find(collectionToUpdate, function(c) {
        return c[uniqueAttribute] === obj[uniqueAttribute];
      });
      if (corresponding) {
        // Already on page, update only visible things
        if (skipProperty && skipValue && corresponding[skipProperty]) {
          if (corresponding[skipProperty] !== skipValue) {
            _.each(watch, function(attribute) {
              if (corresponding[attribute] !== obj[attribute]) {
                corresponding[attribute] = obj[attribute];
              }
            });
          }
        } else {
          _.each(watch, function(attribute) {
            if (corresponding[attribute] !== obj[attribute]) {
              corresponding[attribute] = obj[attribute];
            }
          });
        }
        // Remove from oldCollectionUniques since it has been checked
        oldCollectionUniques = _.without(oldCollectionUniques, corresponding[uniqueAttribute]);
      } else {
        // Not on page, add it
        collectionToUpdate.push(obj);
      }
    });

    // Everything remaining in oldCollectionUniques can be removed since not in newCollection
    for (let i = collectionToUpdate.length; i--; i > 0) {
      if (oldCollectionUniques.indexOf(collectionToUpdate[i][uniqueAttribute]) > -1) {
        collectionToUpdate.splice(i, 1);
      }
    }
  }

  readsAsPairs(readsList) {
    /*
    This function returns a list of objects with properties:
        sampleName: basename with all paired info removed
        read1Path: serverencodedpath of read1
        read2Path: serverencodedpath of read2
        paired: true if both reads, false if one or none
        pairedType: illumina, illuminaIndex, underscore
        fileItems: list of original incoming

    Excpected input is a list of objects as follows:
        basename: filename without extension
        path: path as received
        serverEncodedPath: path with special doirectories replaced by server knonwn code
        filename: complete filename without path
        size: string encoded size
    */

    const checkedReads = [];
    const collectedReads = {};

    const reIlluminaPairedWithSampleNum = /_S[0-9]*_L001_R._001$/;
    const reIlluminaPairedRead1WithSampleNum = /_S[0-9]*_L001_R1_001$/;
    const reIlluminaPairedRead2WithSampleNum = /_S[0-9]*_L001_R2_001$/;
    const reIlluminaPairedWithSampleNumGroup = /_S([0-9]*)_L001_R._001$/;

    const reIlluminaPairedWithSampleNumNoLane = /_S[0-9]*_R._001$/;
    const reIlluminaPairedRead1WithSampleNumNoLane = /_S[0-9]*_R1_001$/;
    const reIlluminaPairedRead2WithSampleNumNoLane= /_S[0-9]*_R2_001$/;
    const reIlluminaPairedWithSampleNumGroupNoLane = /_S([0-9]*)_R._001$/;

    const reIlluminaPaired = /_L001_R._001$/;
    const reIlluminaPairedRead1 = /_L001_R1_001$/;
    const reIlluminaPairedRead2 = /_L001_R2_001$/;

    const reIlluminaPairedIndexes = /_L001_I._001$/;
    const reIlluminaPairedIndexesRead1 = /_L001_I1_001$/;
    const reIlluminaPairedIndexesRead2 = /_L001_I2_001$/;

    const reIlluminaPairedNoLane = /_R._001$/;
    const reIlluminaPairedRead1NoLane = /_R1_001$/;
    const reIlluminaPairedRead2NoLane = /_R2_001$/;

    const reIlluminaPairedIndexesNoLane = /_I._001$/;
    const reIlluminaPairedIndexesRead1NoLane = /_I1_001$/;
    const reIlluminaPairedIndexesRead2NoLane = /_I2_001$/;

    const reGenericPairedR = /_R[1,2]$/;
    const reGenericPairedRead1R = /_R1$/;
    const reGenericPairedRead2R = /_R2$/;

    const reGenericPairedRDot = /.R[1,2]$/;
    const reGenericPairedRead1RDot = /.R1$/;
    const reGenericPairedRead2RDot = /.R2$/;

    const reGenericPaired = /_[1,2]$/;
    const reGenericPairedRead1 = /_1$/;
    const reGenericPairedRead2 = /_2$/;

    let sampleName = null;
    let basename = null;
    let read1Path = null;
    let read2Path = null;
    let pairedType = null;
    let sampleNumber = "";
    let searchNumber;

    if (!readsList || readsList.length === 0) {
      return [];
    }

    _.each(readsList, function(read) {
      basename = read.basename;
      sampleName = null;
      read1Path = null;
      read2Path = null;
      pairedType = null;
      sampleNumber = "";
      searchNumber = [];
      /* get name and test which kind of paired it is */

      if (!sampleName && basename.search(reIlluminaPairedWithSampleNum) > -1) {
        pairedType = 'illuminaWithSample';
        searchNumber = reIlluminaPairedWithSampleNumGroup.exec(basename)
        if (searchNumber.length > 0) {
          sampleNumber = searchNumber[1];
        }
        sampleName = basename.replace(reIlluminaPairedWithSampleNum, '');
        if (basename.search(reIlluminaPairedRead1WithSampleNum) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedRead2WithSampleNum) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reIlluminaPairedWithSampleNumNoLane) > -1) {
        pairedType = 'illuminaWithSampleNoLane';
        searchNumber = reIlluminaPairedWithSampleNumGroupNoLane.exec(basename)
        if (searchNumber.length > 0) {
          sampleNumber = searchNumber[1];
        }
        sampleName = basename.replace(reIlluminaPairedWithSampleNumNoLane, '');
        if (basename.search(reIlluminaPairedRead1WithSampleNumNoLane) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedRead2WithSampleNumNoLane) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reIlluminaPaired) > -1) {
        sampleName = basename.replace(reIlluminaPaired, '');
        pairedType = 'illumina';
        if (basename.search(reIlluminaPairedRead1) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedRead2) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reIlluminaPairedIndexes) > -1) {
        sampleName = basename.replace(reIlluminaPairedIndexes, '_Index');
        pairedType = 'illuminaIndex';
        if (basename.search(reIlluminaPairedIndexesRead1) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedIndexesRead2) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reIlluminaPairedNoLane) > -1) {
        sampleName = basename.replace(reIlluminaPairedNoLane, '');
        pairedType = 'illuminaNoLane';
        if (basename.search(reIlluminaPairedRead1NoLane) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedRead2NoLane) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reIlluminaPairedIndexesNoLane) > -1) {
        sampleName = basename.replace(reIlluminaPairedIndexesNoLane, '_Index');
        pairedType = 'illuminaIndexNoLane';
        if (basename.search(reIlluminaPairedIndexesRead1NoLane) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reIlluminaPairedIndexesRead2NoLane) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }
      
      if (!sampleName && basename.search(reGenericPairedR) > -1) {
        sampleName = basename.replace(reGenericPairedR, '');
        pairedType = 'underscoreR';
        if (basename.search(reGenericPairedRead1R) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reGenericPairedRead2R) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reGenericPairedRDot) > -1) {
        sampleName = basename.replace(reGenericPairedRDot, '');
        pairedType = 'dotR';
        if (basename.search(reGenericPairedRead1RDot) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reGenericPairedRead2RDot) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      if (!sampleName && basename.search(reGenericPaired) > -1) {
        sampleName = basename.replace(reGenericPaired, '');
        pairedType = 'underscore';
        if (basename.search(reGenericPairedRead1) > -1) {
          read1Path = read.serverEncodedPath;
        }
        if (basename.search(reGenericPairedRead2) > -1) {
          read2Path = read.serverEncodedPath;
        }
      }

      // Collect
      if (sampleName) {
        // thre could be same sampeNames with different sampleNumbers. keep them distinct
        if (!collectedReads[sampleName + sampleNumber]) {
          collectedReads[sampleName + sampleNumber] = {
            'fileItems': [],
            sampleName,
            sampleNumber
          };
        }
        if (read1Path) {
          collectedReads[sampleName + sampleNumber].read1Path = read1Path;
          collectedReads[sampleName + sampleNumber].fileItems.push(read);
        }
        if (read2Path) {
          collectedReads[sampleName + sampleNumber].read2Path = read2Path;
          collectedReads[sampleName + sampleNumber].fileItems.push(read);
        }
      }
    });

    // Check collected and only retain pairs
    _.each(collectedReads, function(readPair: any, _) {
      if (readPair.read1Path && readPair.read2Path) {
        readPair = {
          sampleName: readPair.sampleName,
          read1Path: readPair.read1Path,
          read2Path: readPair.read2Path,
          paired: true,
          pairedType: pairedType,
          fileItems: readPair.fileItems,
          sampleNumber: readPair.sampleNumber
        };
        if (readPair.fileItems[0].size) {
          readPair.size = readPair.fileItems[0].size.substr(0, readPair.fileItems[0].size.length - 3) +
           '/' + readPair.fileItems[1].size;
        }
      } else {
        readPair = {
          sampleName: readPair.sampleName,
          read1Path: readPair.read1Path,
          read2Path: readPair.read2Path,
          paired: false,
          pairedType: null,
          fileItems: readPair.fileItems,
          size: readPair.fileItems[0].size,
          sampleNumber: readPair.sampleNumber
        };
        if (readPair.fileItems[0].size) {
          readPair.size = readPair.fileItems[0].size;
        }
      }
      checkedReads.push(readPair);
    });

    return checkedReads;
  }

  parseMilliseconds(milliseconds) {
    /*
    Copied from https://github.com/sindresorhus/parse-ms
    The module is usable only for node. This is way it works in browser
    */
    if (typeof milliseconds !== 'number') {
      throw new TypeError('Expected a number');
    }
  
    const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
  
    return {
      days: roundTowardsZero(milliseconds / 86400000),
      hours: roundTowardsZero(milliseconds / 3600000) % 24,
      minutes: roundTowardsZero(milliseconds / 60000) % 60,
      seconds: roundTowardsZero(milliseconds / 1000) % 60,
      milliseconds: roundTowardsZero(milliseconds) % 1000,
      microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
      nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
    };
  }

  prettyMs(milliseconds, options = {} as any) {
    /*
    Copied from https://github.com/sindresorhus/pretty-ms
    The module is usable only for node. This is way it works in browser
    */
   
    const pluralize = (word, count) => count === 1 ? word : `${word}s`;

    if (!Number.isFinite(milliseconds)) {
      throw new TypeError('Expected a finite number');
    }

    if (options.colonNotation) {
      options.compact = false;
      options.formatSubMilliseconds = false;
      options.separateMilliseconds = false;
      options.verbose = false;
    }

    if (options.compact) {
      options.secondsDecimalDigits = 0;
      options.millisecondsDecimalDigits = 0;
    }

    const result = [];

    const add = (value, long, short, valueString = null) => {
      if ((result.length === 0 || !options.colonNotation) && value === 0 && !(options.colonNotation && short === 'm')) {
        return;
      }

      valueString = (valueString || value || '0').toString();
      let prefix;
      let suffix;
      if (options.colonNotation) {
        prefix = result.length > 0 ? ':' : '';
        suffix = '';
        const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
        const minLength = result.length > 0 ? 2 : 1;
        valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
      } else {
        prefix = '';
        suffix = options.verbose ? ' ' + pluralize(long, value) : short;
      }

      result.push(prefix + valueString + suffix);
    };

    const secondsDecimalDigits =
      typeof options.secondsDecimalDigits === 'number' ?
        options.secondsDecimalDigits :
        1;

    if (secondsDecimalDigits < 1) {
      const difference = 1000 - (milliseconds % 1000);
      if (difference < 500) {
        milliseconds += difference;
      }
    }

    // Round up milliseconds for values lager than 1 minute - 50ms since these
    // always need to be round up. This fixes issues when rounding seconds
    // independently of minutes later on.
    if (
      milliseconds >= (1000 * 60) - 50 &&
      !options.separateMilliseconds &&
      !options.formatSubMilliseconds
    ) {
      const difference = 60 - (milliseconds % 60);
      if (difference <= 50) {
        milliseconds += difference;
      }
    }

    const parsed = this.parseMilliseconds(milliseconds);

    add(Math.trunc(parsed.days / 365), 'year', 'y');
    add(parsed.days % 365, 'day', 'd');
    add(parsed.hours, 'hour', 'h');
    add(parsed.minutes, 'minute', 'm');

    if (
      options.separateMilliseconds ||
      options.formatSubMilliseconds ||
      milliseconds < 1000
    ) {
      add(parsed.seconds, 'second', 's');
      if (options.formatSubMilliseconds) {
        add(parsed.milliseconds, 'millisecond', 'ms');
        add(parsed.microseconds, 'microsecond', 'µs');
        add(parsed.nanoseconds, 'nanosecond', 'ns');
      } else {
        const millisecondsAndBelow =
          parsed.milliseconds +
          (parsed.microseconds / 1000) +
          (parsed.nanoseconds / 1e6);

        const millisecondsDecimalDigits =
          typeof options.millisecondsDecimalDigits === 'number' ?
            options.millisecondsDecimalDigits :
            0;

        const roundedMiliseconds = millisecondsAndBelow >= 1 ?
          Math.round(millisecondsAndBelow) :
          Math.ceil(millisecondsAndBelow);

        const millisecondsString = millisecondsDecimalDigits ?
          millisecondsAndBelow.toFixed(millisecondsDecimalDigits) :
          roundedMiliseconds;

        add(
          parseFloat(millisecondsString as any),
          'millisecond',
          'ms',
          millisecondsString
        );
      }
    } else {
      const seconds = (milliseconds / 1000) % 60;
      const secondsDecimalDigits =
        typeof options.secondsDecimalDigits === 'number' ?
          options.secondsDecimalDigits :
          1;
      const secondsFixed = seconds.toFixed(secondsDecimalDigits);
      const secondsString = options.keepDecimalsOnWholeSeconds ?
        secondsFixed :
        secondsFixed.replace(/\.0+$/, '');
      add(parseFloat(secondsString), 'second', 's', secondsString);
    }

    if (result.length === 0) {
      return '0' + (options.verbose ? ' milliseconds' : 'ms');
    }

    if (options.compact) {
      return result[0];
    }

    if (typeof options.unitCount === 'number') {
      const separator = options.colonNotation ? '' : ' ';
      return result.slice(0, Math.max(options.unitCount, 1)).join(separator);
    }

    return options.colonNotation ? result.join('') : result.join(' ');
  }

  illuminaSampleNameFromBasename(basename) {
    const reIlluminaPairedWithSample = /_S[0-9]+_L001_R[1,2]_[0-9]+$/;
    const reIlluminaPaired = /_L001_R[1,2]_[0-9]+$/;
    const reIlluminaPairedNoLane = /_R._001$/;
    const reGenericPaired = /_[1,2]$/;

    if (!basename || basename == "") {
      return "";
    }

    if (basename.search(reIlluminaPairedWithSample) > -1) {
      return basename.replace(reIlluminaPairedWithSample, '');
    }

    if (basename.search(reIlluminaPaired) > -1) {
      return basename.replace(reIlluminaPaired, '');
    }

    if (basename.search(reIlluminaPairedNoLane) > -1) {
      return basename.replace(reIlluminaPairedNoLane, '');
    }

    if (basename.search(reGenericPaired) > -1) {
      return  basename.replace(reGenericPaired, '');
    }

    return basename;
  }

  /*
  Get to a value using a string containing dots
  */
  getValueFromObjectByString(obj, propertyString) {
    propertyString = propertyString.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    propertyString = propertyString.replace(/^\./, ''); // strip a leading dot
    propertyString = propertyString.replace("?", ''); // remove question marks (from angular templating)
    let a = propertyString.split('.');
    try {
      for (let i = 0, n = a.length; i < n; ++i) {
        let k = a[i];
        if (k in obj) {
          obj = obj[k];
        } else {
          return;
        }
      }
    } catch(e) {
      obj = undefined;
    }
    return obj;
  }

  pedToObject(ped) {
    const members: any = Object.values(ped)[0];
    // TODO. siblings!. Currently only proband mother, father
    // mother and/or father are recognized
    // find proband
    let proband;
    let asObject = {};
    members.forEach(member => {
      if ((member.father || member.mother) && member.phenotype == "2") {
        proband = {
          "relation": "proband",
          "id": member.id,
          "sex": member.sex == "1" ? "m": member.sex == 2 ? "f" : " unk",
          "affected": "yes",
          "mother": member.mother,
          "father": member.father,
          "familyId": member.family_id
        };
        asObject[member.id] = proband;
      }
    });

    // find parents
    if (proband) {
      members.forEach(member => {
        if (member.id == proband.mother) {
          asObject[member.id] = {
            "relation": "mother",
            "id": member.id,
            "sex": member.sex == "1" ? "m": member.sex == 2 ? "f" : " unk",
            "affected": member.phenotype == "1" ? "no": member.phenotype == 2 ? "yes" : " unk"
          }
        }
        if (member.id == proband.father) {
          asObject[member.id] = {
            "relation": "father",
            "id": member.id,
            "sex": member.sex == "1" ? "m": member.sex == 2 ? "f" : " unk",
            "affected": member.phenotype == "1" ? "no": member.phenotype == 2 ? "yes" : " unk"
          }
        }
      });
    }

    // remaining
    members.forEach(member => {
      if (!asObject[member.id]) {
        asObject[member.id] = {
          "relation": "unknown", // could be sibling or cousin or ???
          "id": member.id,
          "sex": member.sex == "1" ? "m": member.sex == 2 ? "f" : " unk",
          "affected": "yes",
          "mother": member.mother,
          "father": member.father
        };
        asObject[member.id] = proband;
      }
    });
    return asObject;
  }

  pedObjectAsList(pedObject) {
    // order wanted: proband(s) (every body else) mother father;
    const probands = [];
    const other = [];
    let mother;
    let father;
    const sorted = [];

    Object.values(pedObject).forEach((m: any) => {
      if (m.relation == "proband") {
        probands.push(m.id)
      } else if (m.relation == "mother") {
        mother = m.id;
      } else if (m.relation == "father") {
        father = m.id;
      } else {
        other.push(m.id);
      }
    });
    
    probands.forEach(x => {
      sorted.push(pedObject[x]);
    });
    other.forEach(x => {
      sorted.push(pedObject[x]);
    });
    if (mother) {
      sorted.push(pedObject[mother]);
    }
    if (father) {
      sorted.push(pedObject[father]);
    }

    return sorted;
  }

}


/*
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
}*/

/*Array.prototype.getUnique = function() {
   var u = {}, a = [];
   for (var i = 0, l = this.length; i < l; ++i) {
      if (u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};*/
