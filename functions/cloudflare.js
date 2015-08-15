var schedule = require('node-schedule');
var cloudflare = require('cloudflare');
var Config = require('../models/config');
var Device = require('../models/device');

function updateCloudflare (cb) {
  Config.findOne({}, function (err, config) {
    if (err) return cb(err);
    if (!config) return cb('Not yet configured');
    var client = cloudflare.createClient({
      email: config.cloudflare.user,
      token: config.cloudflare.key
    });
    client.listDomains(function (err, domains) {
      var domain = null;
      domains.forEach(function(zone) {
        if (zone.zone_name === config.domain) domain = zone;
      });
      if (!domain) return cb('Domain not found in Cloudflare');
      client.listDomainRecords(domain.zone_name, function (err, records) {
        if (err) return cb(err);
        Device.find({}, function (err, devices) {
          if (err) return cb(err);
          devices.forEach(function (device) {
            var exists = false;
            var record = null;
            records.forEach(function(rec) {
              if (rec.display_name === device.domain && rec.type === 'AAAA') {
                exists = true;
                record = rec;
              }
            });
            
            if (exists) {
              return client.editDomainRecord(domain.zone_name, record.rec_id, {
                name: device.domain,
                type: 'AAAA',
                content: device.ip,
                ttl: 1,
              }, function (err, result) {
                if (err) return cb(err);
                cb(null, result);
              });
            }
            client.addDomainRecord(domain.zone_name, {
              name: device.domain,
              type: 'AAAA',
              content: device.ip,
              ttl: 1
            }, function (err, result) {
              if (err) return cb(err);
              cb(null, result);
            })
          });
        });
        cb(null, records);
      });
    });
  });
}

exports.updateCloudflare = updateCloudflare;