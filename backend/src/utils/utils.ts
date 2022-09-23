/*jslint node: true */
import _ from 'lodash';

let numberReg = /^-?\d*[\.]?\d+$/;

let utils: any = {
  getValueFromObjectByString: getValueFromObjectByString,
  sortByMultiple: sortByMultiple,
  bioseqNoExtension: bioseqNoExtension,
  makeId: makeId,
  copySequence: copySequence,
  escapeRegExp: escapeRegExp,
  downloadResource: downloadResource
};

/*
Get to a value using a string containing dots
*/
function getValueFromObjectByString(obj, propertyString) {
  propertyString = propertyString.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  propertyString = propertyString.replace(/^\./, ''); // strip a leading dot
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

function copySequence(sequence) {
  let copy = [];
  for (let i = 0; i < sequence.length; ++i) {
    copy.push(sequence[i]);
  }
  return copy;
}

function compareBy(x, y, key, dir) {
  // HACK for FOMRAT.AFD, client has an object with ref and avr but data only has AFD with comma
  let xVal;
  let yVal;

  if (dir !== 1 && dir !== -1) {
    dir = 1;
  }

  // Get actually value to sort from object
  if (key === "FORMAT.AFD.ref") {
    xVal = x.FORMAT.AFD.split(",")
    yVal = y.FORMAT.AFD.split(",")

    if (xVal.length && xVal.length === 2) {
      xVal = xVal[0];
    }
    if (yVal.length && yVal.length === 2) {
      yVal = yVal[0];
    }
  } else if (key === "FORMAT.AFD.var") {
    xVal = x.FORMAT.AFD.split(",")
    yVal = y.FORMAT.AFD.split(",")
    if (xVal.length && xVal.length === 2) {
      xVal = xVal[1];
    }
    if (yVal.length && yVal.length === 2) {
      yVal = yVal[1];
    }
  } else {
    xVal = getValueFromObjectByString(x, key);
    yVal = getValueFromObjectByString(y, key);
  }

  // Handle numeric values
  if (numberReg.test(xVal)) {
    xVal = parseFloat(xVal);
  }

  if (numberReg.test(yVal)) {
    yVal = parseFloat(yVal);
  }

  // Now compare both
  if (xVal === null || xVal === undefined) {
    return dir === 1 ? 1 : -1;
  }
  else if (yVal === null || yVal === undefined) {
    return dir === 1 ? -1 : 1;
  }
  else if (xVal === yVal) {
    return 0;
  }
  else if (dir === -1) {
    return xVal < yVal ? 1 : -1;
  }
  else if (dir === 1) {
    return xVal > yVal ? 1 : -1;
  }
}

//http://stackoverflow.com/questions/18222517/multi-sorting-in-underscore (+ I added direction)
function sortByMultiple(sequence, multiSortArray) {
  /*
  incoming = array of objects with 'field' and 'order' (1 or -1)
  */
  let comparison = 0;
  let orderByDir;
  let orderByField;
  let copy = copySequence(sequence);

  copy.sort(function(x, y) {
    for (let i = 0; i < multiSortArray.length; ++i) {
      orderByField = multiSortArray[i].field;
      orderByDir = parseInt(multiSortArray[i].order, 10);
      comparison = compareBy(x, y, orderByField, orderByDir);
      if (comparison !== 0) {
        return comparison;
      }
    }
    return comparison;
  });
  return copy;
}

function bioseqNoExtension(fileName) {
  /*
  If two or more dots and not in accepted double dot extensions, strip after last dot
  */

  let acceptedDoubles = [
    '.fastq.gz',
    '.vcf.gz',
    '.ace.gz'
  ];
  let split = fileName.split('.');
  let splitLength = split.length;
  if (splitLength >= 2) {
    //we have at least two dots
    let lastTwo = '.' + split[splitLength - 2] + '.' + split[splitLength - 1];
    if (acceptedDoubles.indexOf(lastTwo) > -1) {
      return fileName.replace(lastTwo, '');
    } else {
      return fileName.replace('.' + split[splitLength - 1], '');
    }
  } else {
    return split[0];
  }
}

function makeId(length) {
  //in python: os.urandom(16).encode('hex')
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return a2hex(text);
}

function a2hex(str) {
  let arr = [];
  for (let i = 0, l = str.length; i < l; i++) {
    let hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function downloadResource(res, fileName, data) {
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  let mergedCols = [];
  _.each(data, (row) => {
    mergedCols.push('"' + row.join('","') + '"');
  });
  let toSend = mergedCols.join("\n");
  /*res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-Length': toSend.length
  });*/
  return res.send(toSend);
}

export = utils;
