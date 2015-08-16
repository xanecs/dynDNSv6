var Config = require('../models/config.js');

module.exports = function (router) {
  router.get('/config', function (req, res, next) {
    if (!req.config) {
      req.flash('errors', 'Not yet configured');
      req.config = {
        domain: '',
        cloudflare: {
          user: '',
          key: ''
        }
      };
    }
    req.config.errors = req.flash('errors');
    res.render('config/index', req.config);
  });
  
  router.post('/config', function (req, res, next) {
    if (!req.config) {
      var newConf = new Config(req.body);
      return newConf.save(function (err) {
        if (err) return next(err);
        res.redirect('/config');
      });
    }
    Config.update({}, req.body, function (err, result) {
      if (err) return next(err);
      res.redirect('/config');
    });
  });
};
