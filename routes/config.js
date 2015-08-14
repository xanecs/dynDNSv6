module.exports = function (router) {
  router.get('/config', function (req, res) {
    res.render('config/index', {
      domain: '',
      cloudflare: {
        user: '',
        key: ''
      }
    });
  });
};
