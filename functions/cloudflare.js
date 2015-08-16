var cloudflare = require('cloudflare');
var Config = require('../models/config');
var Device = require('../models/device');
var async = require('async');

function updateDevice (domain, client, records) {
  return function (device, cb) {
    async.detect(records, function (record, cb) {
      cb(record.display_name === device.domain && record.type === 'AAAA');
    },
    function (record) {
      var options = {
        name: device.domain,
        type: 'AAAA',
        content: device.ip,
        ttl: 1
      };
      var handleResult = function (err, result) {
        if (err) return cb(err);
        cb(null);
      };
      if (record) return client.editDomainRecord(domain.zone_name, record.rec_id, options, handleResult);
      client.addDomainRecord(domain.zone_name, options, handleResult);
    });
  };
}

function handleDomain (client, cb) {
  return function (domain) {
    if (!domain) return cb('Domain not found');
    client.listDomainRecords(domain.zone_name, function (err, records) {
      if (err) return cb(err);
      Device.find({}, function (err, devices) {
        if (err) return cb(err);
        async.each(devices, updateDevice(domain, client, records), function(err) {
          cb(err);
        });
      })
    });
  };
}

function updateCloudflare (cb) {
  Config.findOne({}, function (err, config) {
    if (err) return cb(err);
    if (!config) return cb('Not yet configured');
    var client = cloudflare.createClient({
      email: config.cloudflare.user,
      token: config.cloudflare.key
    });
    client.listDomains(function (err, domains) {
      if(err) return cb(err);
      async.detect(domains, function(zone, cb) {
        cb(zone.zone_name === config.domain);
      }, handleDomain(client, cb));
    });
  });
}

exports.updateCloudflare = updateCloudflare;