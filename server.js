var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sessions = require('express-session');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');

var schedule = require('./functions/schedule');
var Config = require('./models/config');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser('secret'));
app.use(sessions({cookie: {maxAge: 60000}, secret: 'secret', resave: true, saveUninitialized: true}));
app.use(flash());

app.use(function (req, res, next) {
  Config.findOne({}, function (err, config) {
    if (err) return next(err);
    if (!config) {
      if (req.path === '/config') return next();
      return res.redirect('/config');
    }
    req.config = config;
    return next();
  });
});

var router = express.Router();
require('./routes/main.js')(router);
require('./routes/device.js')(router);
require('./routes/config.js')(router);

app.use(router);

app.use(function (err, req, res, next) {
  console.error(err);
  var message = 'An unknown error occured';
  if (err.name === 'ValidationError') {
    message = 'Could not validate your data';
    if (err.errors.mac) {
      message = 'Invalid MAC address';
    }
  }
  req.flash('errors', message);
  res.redirect(req.redirect || req.path);
});

mongoose.connect('localhost', 'dyndns');
schedule.schedule(function (err) {
  if (err) console.error(err);
});
app.listen(3003);
