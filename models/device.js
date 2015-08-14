var mongoose = require('mongoose');
var ip = require('../functions/ip');

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
  return prefix + ':' + mac[0] + mac[1] + ':' + mac[2] + 'ff:fe' + mac[3] + ':' + mac[4] + mac[5];
});

module.exports = mongoose.model('Device', deviceSchema);
