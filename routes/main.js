var schedule = require('../functions/schedule');

module.exports = function (router) {
  router.get('/', function (req, res) {
    res.render('index', {errors: req.flash('errors'), status: schedule.status()});
  });

  router.post('/update', function (req, res, next) {
    req.redirect = '/';
    schedule.jobFunc(false, function (err) {
      if(err) return next(err);
      req.flash('errors', 'Update successful');
      res.redirect('/');
    });
  });
  
  router.post('/forceupdate', function (req, res, next) {
    req.redirect = '/';
    schedule.jobFunc(true, function (err) {
      if(err) return next(err);
      req.flash('errors', 'Update successful');
      res.redirect('/');
    });
  });
};
