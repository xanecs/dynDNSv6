var Device = require('../models/device');
var ip = require('../functions/ip');

module.exports = function (router) {
  router.get('/prefix', function (req, res) {
    res.send(ip.prefix());
  });

  router.get('/devices', function (req, res) {
    Device.find({}, function (err, results) {
      res.render('device/list', {devices: results});
    });
  });

  router.get('/devices/new', function (req, res) {
    res.render('device/new');
  });

  router.post('/devices', function (req, res) {
    var nDev = new Device(req.body);
    nDev.save(function (err, result) {
      if (err) res.send(err);
      res.redirect('/devices');
    });
  });

  router.post('/devices/delete/:mac', function (req, res) {
    Device.find({mac: req.params.mac}).remove(function (err, result) {
      if (err) res.send(err);
      res.redirect('/devices');
    });
  });

  router.get('/devices/:mac', function (req, res) {
    Device.findOne({mac: req.params.mac}, function (err, device) {
      if (err) res.send(err);
      res.render('device/single', {device: device.toObject({virtuals: true})});
    });
  });

  router.get('/devices/edit/:mac', function (req, res) {
    Device.findOne({mac: req.params.mac}, function (err, device) {
      if (err) res.send(err);
      res.render('device/edit', {device: device});
    });
  });

  router.post('/devices/:mac', function (req, res) {
    Device.update({mac: req.params.mac}, req.body, function (err, device) {
      if (err) res.send(err);
      res.redirect('/devices');
    });
  });
};
