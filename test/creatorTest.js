'use strict';

import * as fs from 'fs/promises';
import * as path from 'path';
import * as bplistParser from 'bplist-parser';
import bplistCreator from '../bplistCreator.js';
import * as assert from 'assert';

const dirname = path.dirname(new URL(import.meta.url).pathname);

describe('bplist-creator', async function () {
  //  'iTunes Small': function(test) {
  //    var file = path.join(dirname, "iTunes-small.bplist");
  //    testFile(test, file);
  //  },

  it('sample1', async function () {
    var file = path.join(dirname, "sample1.bplist");
    await testFile(file);
  });

  it('sample2', async function () {
    var file = path.join(dirname, "sample2.bplist");
    await testFile(file);
  });

  it('binary data', async function () {
    var file = path.join(dirname, "binaryData.bplist");
    await testFile(file);
  });

  it('airplay', async function () {
    var file = path.join(dirname, "airplay.bplist");
    await testFile(file);
  });

  it('integers', async function () {
    var file = path.join(dirname, "integers.bplist");
    await testFile(file);
  });

  //  'utf16': function(test) {
  //    var file = path.join(dirname, "utf16.bplist");
  //    testFile(test, file);
  //  },

  //  'uid': function(test) {
  //    var file = path.join(dirname, "uid.bplist");
  //    testFile(test, file);
  //  }
});

async function testFile (file) {
  const fileData = await fs.readFile(file);
  const dicts = await bplistParser.parseFile(file);
 
  // airplay overrides
  if (dicts && dicts[0] && dicts[0].loadedTimeRanges && dicts[0].loadedTimeRanges[0] && dicts[0].loadedTimeRanges[0].hasOwnProperty('start')) {
    dicts[0].loadedTimeRanges[0].start = {
      bplistOverride: true,
      type: 'double',
      value: dicts[0].loadedTimeRanges[0].start
    };
  }
  if (dicts && dicts[0] && dicts[0].loadedTimeRanges && dicts[0].seekableTimeRanges[0] && dicts[0].seekableTimeRanges[0].hasOwnProperty('start')) {
    dicts[0].seekableTimeRanges[0].start = {
      bplistOverride: true,
      type: 'double',
      value: dicts[0].seekableTimeRanges[0].start
    };
  }
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('rate')) {
    dicts[0].rate = {
      bplistOverride: true,
      type: 'double',
      value: dicts[0].rate
    };
  }

  // utf16
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('NSHumanReadableCopyright')) {
    dicts[0].NSHumanReadableCopyright = {
      bplistOverride: true,
      type: 'string-utf16',
      value: dicts[0].NSHumanReadableCopyright
    };
  }
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('CFBundleExecutable')) {
    dicts[0].CFBundleExecutable = {
      bplistOverride: true,
      type: 'string',
      value: dicts[0].CFBundleExecutable
    };
  }
  if (dicts && dicts[0] && dicts[0].CFBundleURLTypes && dicts[0].CFBundleURLTypes[0] && dicts[0].CFBundleURLTypes[0].hasOwnProperty('CFBundleURLSchemes')) {
    dicts[0].CFBundleURLTypes[0].CFBundleURLSchemes[0] = {
      bplistOverride: true,
      type: 'string',
      value: dicts[0].CFBundleURLTypes[0].CFBundleURLSchemes[0]
    };
  }
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('CFBundleDisplayName')) {
    dicts[0].CFBundleDisplayName = {
      bplistOverride: true,
      type: 'string',
      value: dicts[0].CFBundleDisplayName
    };
  }
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('DTPlatformBuild')) {
    dicts[0].DTPlatformBuild = {
      bplistOverride: true,
      type: 'string',
      value: dicts[0].DTPlatformBuild
    };
  }

  // integer
  if (dicts && dicts[0] && dicts[0].hasOwnProperty('int64item')) {
    dicts[0].int64item = {
      bplistOverride: true,
      type: 'number',
      value: dicts[0].int64item.value
    };
  }

  var buf = bplistCreator(dicts);
  compareBuffers(buf, fileData);
}

function compareBuffers(buf1, buf2) {
  if (buf1.length !== buf2.length) {
    printBuffers(buf1, buf2);
    return assert.fail("buffer size mismatch. found: " + buf1.length + ", expected: " + buf2.length + ".");
  }
  for (var i = 0; i < buf1.length; i++) {
    if (buf1[i] !== buf2[i]) {
      printBuffers(buf1, buf2);
      return assert.fail("buffer mismatch at offset 0x" + i.toString(16) + ". found: 0x" + buf1[i].toString(16) + ", expected: 0x" + buf2[i].toString(16) + ".");
    }
  }
}

function printBuffers(buf1, buf2) {
  var i, t;
  for (var lineOffset = 0; lineOffset < buf1.length || lineOffset < buf2.length; lineOffset += 16) {
    var line = '';

    t = ('000000000' + lineOffset.toString(16));
    line += t.substr(t.length - 8) + ': ';

    for (i = 0; i < 16; i++) {
      if (i == 8) {
        line += ' ';
      }
      if (lineOffset + i < buf1.length) {
        t = ('00' + buf1[lineOffset + i].toString(16));
        line += t.substr(t.length - 2) + ' ';
      } else {
        line += '   ';
      }
    }
    line += ' ';
    for (i = 0; i < 16; i++) {
      if (lineOffset + i < buf1.length) {
        t = String.fromCharCode(buf1[lineOffset + i]);
        if (t < ' ' || t > '~') {
          t = '.';
        }
        line += t;
      } else {
        line += ' ';
      }
    }

    line += ' - ';

    for (i = 0; i < 16; i++) {
      if (i == 8) {
        line += ' ';
      }
      if (lineOffset + i < buf2.length) {
        t = ('00' + buf2[lineOffset + i].toString(16));
        line += t.substr(t.length - 2) + ' ';
      } else {
        line += '   ';
      }
    }
    line += ' ';
    for (i = 0; i < 16; i++) {
      if (lineOffset + i < buf2.length) {
        t = String.fromCharCode(buf2[lineOffset + i]);
        if (t < ' ' || t > '~') {
          t = '.';
        }
        line += t;
      } else {
        line += ' ';
      }
    }

    console.log(line);
  }
}
