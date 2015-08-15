var mongoose = require('mongoose');

var configSchema = new mongoose.Schema({
  domain: {type: String, required: true},
  cloudflare: {
    user: {type: String, required: true},
    key: {type: String, required: true}
  },
  interval: {type: String, required: true}
});

var Config = mongoose.model('Config', configSchema);
module.exports = Config;