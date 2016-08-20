var Cloudflare = require('cloudflare');
var Config = require('../models/config');
var Device = require('../models/device');
var async = require('async');

function updateCloudflare (cb) {
  Config.findOne({}, function (err, config) {
    if (err) return cb(err);
    if (!config) return cb('Not yet configured!');
    var client = new Cloudflare({
      email: config.cloudflare.user,
      key: config.cloudflare.key
    });
    client.browseZones().then(function(zones) {
      async.detect(zones.result, function (zone, cb) {
        cb(null, zone.name == config.domain);
      }, handleDomain(client, cb));
    }).catch(function(error) {
      cb(error);
    });
  });
}

function handleDomain(client, cb) {
  return function (err, zone) {
    if(err) return cb(err);
    client.browseDNS(zone.id, null, {per_page: 100}).then(function(dnses) {
      Device.find({}, function (err, devices) {
        if (err) return cb(err);
        async.each(devices, updateDevice(zone, client, dnses.result), function(err) {
          cb(err);
        });
      });
    }).catch(function(error) {
      cb(error);
    })
  }
}

function updateDevice (zone, client, records) {
  return function (device, cb) {
    async.detect(records, function (record, cb) {
      cb(null, record.name.split('.')[0] === device.domain && record.type === 'AAAA');
    }, function (err, record) {
      if (err) return cb(err);
        var options = {
          name: device.domain + '.' + zone.name,
          type: 'AAAA',
          content: device.ip,
          ttl: 1,
          zoneId: zone.id
        };

        if (record) options.id = record.id;

        var nRecord = Cloudflare.DNSRecord.create(options);
        if (record) {
          client.editDNS(nRecord).then(function() {cb(null)}).catch(cb);
        } else {
          client.addDNS(nRecord).then(function() {cb(null)}).catch(cb);
        }
    })
  }
}

exports.updateCloudflare = updateCloudflare;
