#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var dirName = '.';

var timestampPattern = /(\d\d):(\d\d):(\d\d)[,\.](\d\d\d)/gi;

// Slope (a) and intercept (b) of linear function (ax+b)
var a = 0.95767;
var b = 350;

var readSrtDir = function() {
  fs.readdir(dirName, function(err, files) {
    if (err) {
      throw err;
    }
    files.map(function (file) {
      return path.join(dirName, file);
    }).filter(function (file) {
      return fs.statSync(file).isFile() && path.extname(file) == '.srt';
    }).forEach(function (file) {
      readSrtFile(file);
    });
  });
};

var readSrtFile = function(fileName) {
  fs.exists(fileName, function(exists) {
    if (!exists) {
      console.error('File \'' + fileName + '\' not found');
    } else {
      fs.readFile(fileName, function(err, data) {
        if (err) {
          console.error('Can\'t read srt file. Here is the details:');
          console.error(err);
          process.exit(1);
        } else {
          parseSrtFile(fileName, data.toString());
        }
      });
    }
  });
};

var parseSrtFile = function(fileName, data) {
  var newData = data.replace(
    timestampPattern,
    function(timestamp, p1, p2, p3, p4) {
      var milliseconds = convertTimestampToMilliseconds(p1, p2, p3, p4);
      milliseconds = updateTime(milliseconds, a, b);
      return convertMillisecondsToTimestamp(milliseconds);
    }
  );
  fs.writeFileSync(fileName, newData);
};

var convertTimestampToMilliseconds = function(p1, p2, p3, p4) {
  p1 = parseInt(p1, 10);
  p2 = parseInt(p2, 10);
  p3 = parseInt(p3, 10);
  p4 = parseInt(p4, 10);

  return p1 * 3600000 + p2 * 60000 + p3 * 1000 + p4;
};

var convertMillisecondsToTimestamp = function(milliseconds) {
  var p1 = Math.floor(milliseconds / 3600000);
  var p2 = Math.floor((milliseconds - p1 * 3600000) / 60000);
  var p3 = Math.floor((milliseconds - p1 * 3600000 - p2 * 60000) / 1000);
  var p4 = Math.floor(milliseconds - p1 * 3600000 - p2 * 60000 - p3 * 1000);

  p1 = ('0' + p1).substr(-2);
  p2 = ('0' + p2).substr(-2);
  p3 = ('0' + p3).substr(-2);
  p4 = ('00' + p4).substr(-3);

  return p1 + ':' + p2 + ':' + p3 + ',' + p4;
};

var updateTime = function(x, a, b) {
  return x * a + b;
};

readSrtDir();
