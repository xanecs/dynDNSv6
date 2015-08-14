var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());

var router = express.Router();
require('./routes/main.js')(router);
require('./routes/device.js')(router);
require('./routes/config.js')(router);

app.use(router);

mongoose.connect('localhost', 'dyndns');
app.listen(3000);
