var Device = require('../models/device');
var ip = require('../functions/ip');

module.exports = function (router) {
  router.get('/prefix', function (req, res) {
    res.send(ip.prefix());
  });

  router.get('/devices', function (req, res, next) {
    Device.find({}, function (err, results) {
      if (err) return next(err);
      res.render('device/list', {devices: results, errors: req.flash('errors')});
    });
  });

  router.get('/devices/new', function (req, res, next) {
    res.render('device/new', {errors: req.flash('errors')});
  });

  router.post('/devices', function (req, res, next) {
    var nDev = new Device(req.body);
    nDev.save(function (err, result) {
      if (err) return next(err);
      res.redirect('/devices');
    });
  });

  router.post('/devices/delete/:mac', function (req, res, next) {
    Device.find({mac: req.params.mac}).remove(function (err, result) {
      if (err) {
        req.redirect = '/device/' + req.params.mac;
        return next(err);
      }
      res.redirect('/devices');
    });
  });

  router.get('/devices/:mac', function (req, res, next) {
    Device.findOne({mac: req.params.mac}, function (err, device) {
      if (err) return next(err);
      res.render('device/single', {device: device.toObject({virtuals: true}), errors: req.flash('errors')});
    });
  });

  router.get('/devices/edit/:mac', function (req, res, next) {
    Device.findOne({mac: req.params.mac}, function (err, device) {
      if (err) return next(err);
      res.render('device/edit', {device: device, errors: req.flash('errors')});
    });
  });

  router.post('/devices/:mac', function (req, res, next) {
    Device.update({mac: req.params.mac}, req.body, {runValidators: true}, function (err, device) {
      if (err) {
        req.redirect = '/devices/edit/' + req.params.mac;
        return next(err);
      }
      res.redirect('/devices');
    });
  });
};
