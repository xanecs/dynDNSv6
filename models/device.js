var mongoose = require('mongoose');
var ip = require('../functions/ip');
var binstring = require('binstring');

function toLower (v) {
  return v.toLowerCase();
}

var deviceSchema = new mongoose.Schema({
  name: {type: String, required: true},
  mac: {type: String, set: toLower, required: true},
  domain: {type: String, set: toLower, required: true}
});

deviceSchema.virtual('ip').get(function () {
  var prefix = ip.prefix()[0];
  var mac = this.mac.toLowerCase().split(':');
  var firstByte = binstring(mac[0], {in: 'hex', out: 'bytes'})[0];
  var flipped = firstByte ^ 2;
  console.log(flipped);
  var flippedByte = binstring([flipped], {in: 'bytes', out: 'hex'});
  return prefix + ':' + flippedByte + mac[1] + ':' + mac[2] + 'ff:fe' + mac[3] + ':' + mac[4] + mac[5];
});

var Device = mongoose.model('Device', deviceSchema);

Device.schema.path('mac').validate(function (value) {
  return /^([0-9a-f]{2}[:-]){5}([0-9a-f]{2})$/.test(value);
}, 'Invalid MAC Address');

module.exports = Device;
