var themes = require(__dirname + '../../themes/themes');
var admin = require(__dirname + '/admin');
const helmet = require('helmet')

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

  // app.use(express.static(__dirname + '/public' ));


  router.get('/', function (req, res) {
    let url = req.url;
    res.send(page);
  });

  // router.get('/admin*', function (req, res) {
  //   res.send(adminPage);
  // });

  router.get('/admin', function (req, res) {
    res.send(adminPage);
  });

  router.get('/admin/content-types', function (req, res) {
    res.send(adminPage);
  });

  // app.use('/admin', function(req, res, next) {
  //   console.log('admin route', req.url);
  //   res.send(adminPage);
  // });

  // app.use(/\/((?!admin).)*/, function(){
  //   return "ok";
  // });

  // app.get('*', function(req, res){
  //   res.send(adminPage);
  // });

// Allow from a specific host.
// Sets "X-Frame-Options: ALLOW-FROM http://example.com".
app.use(helmet.frameguard({
  action: 'allow-from',
  domain: 'http://localhost:4200'
}))

// app.use(helmet.frameguard({ action: 'sameorigin' }))


// app.use(helmet.frameguard({ action: 'allow' }))


// app.use(helmet.frameguard({ action: 'sameorigin' }))


  app.use(router);

};  