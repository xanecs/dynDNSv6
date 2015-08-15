var cf = require('../functions/cloudflare');

module.exports = function (router) {
  router.get('/', function (req, res) {
    
    res.render('index');
  });
  
  router.post('/update', function (req, res) {
    cf.updateCloudflare(function (err, result) {
    });
  })
};
