var os = require('os');
var v6 = require('ip-address').Address6;

exports.prefix = function () {
  var nics = os.networkInterfaces();
  var prefixes = [];
  for (var key in nics) {
    var nic = nics[key];
    for (var i = 0; i < nic.length; i++) {
      address = nic[i];
      if (address.internal) continue;
      if (address.family !== 'IPv6') continue;
      if (address.address.indexOf('fe80::') === 0) continue; //Ignore link-local prefixes
      if (address.address.indexOf('4006:') === 0) continue; //Ignore bogus prefixes created by iOS bug.

      var addr = new v6(address.address + '/64');
      prefixes.push(addr.parsedAddress.slice(0, 4).join(':'));
    }
  }
  return prefixes;
};
