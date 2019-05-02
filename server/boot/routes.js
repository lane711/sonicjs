var themes = require(__dirname + '/../themes/themes');
var admin = require(__dirname + '/admin');

module.exports = function (app) {
  var router = app.loopback.Router();

  let page = '';
  let adminPage = '';

  (async () => {
    page = await themes.getTheme();
    // console.log('asunc page ==>', page);
  })();

  (async () => {
    adminPage = await admin.loadAdmin();
    // console.log('asunc page ==>', page);
  })();

  router.get('/', function (req, res) {
    let url = req.url;
    res.send(page);
  });

  router.get('/admin', function (req, res) {
    let url = req.url;
    res.send(adminPage);
  });

  app.use(router);

};  