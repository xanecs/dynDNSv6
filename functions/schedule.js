var ip = require('./ip');
var schedule = require('node-schedule');
var Config = require('../models/config');
var cf = require('./cloudflare');

var lastRun = 'Never';
var numRuns = 0;
var lastChangeRun = 'Never';
var numChangeRuns = 0;
var job = null;
var lastError = null;
var lastPrefix = 'Not yet';

function jobFunc(force, cb) {
  lastRun = new Date();
  numRuns += 1;
  var newPrefix = ip.prefix()[0];
  if (force || newPrefix !== lastPrefix) {
    return cf.updateCloudflare(function (err) {
      lastChangeRun = lastRun;
      numChangeRuns += 1;
      lastPrefix = newPrefix;
      if (err) {
        lastError = err;
        if (cb) return cb(err);
        return console.error(err);
      }
      if (cb) cb(null, true);
    });
  }
  if (cb) cb(null, false)
}

function scheduleJob(cb) {
  Config.findOne({}, function (err, config) {
    if(err) return cb(err);
    if(!config) return cb('Not yet configured');
    job = schedule.scheduleJob(config.interval, jobFunc);
  });
}

function status() {
  return {
    lastRun: lastRun,
    numRuns: numRuns,
    lastChangeRun: lastChangeRun,
    numChangeRuns: numChangeRuns,
    lastPrefix: lastPrefix,
    lastError: lastError
  };
}

exports.jobFunc = jobFunc;
exports.schedule = scheduleJob;
exports.status = status;