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

function scheduleJob(cb) {
  Config.findOne({}, function (err, config) {
    if(err) return cb(err);
    if(!config) return cb('Not yet configured');
    job = schedule.scheduleJob(config.interval, function () {
      lastRun = Date.now();
      numRuns += 1;
      var newPrefix = ip.prefix();
      if (newPrefix !== lastPrefix) {
        cf.updateCloudflare(function (err) {
          lastChangeRun = lastRun;
          numChangeRuns += 1;
          lastPrefix = newPrefix;
          if (err) {
            lastError = err;
            return console.error(err);
          }
          
        });
      }
    });
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

exports.schedule = scheduleJob;
exports.status = status;