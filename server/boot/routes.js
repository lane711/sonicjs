var themes = require(__dirname + '../../themes/themes');
var pageBuilderService = require('../services/page-builder.service');
var formio = require('../services/formio.service');
var eventBusService = require('../services/event-bus.service');

var moduleService = require('../services/module.service').startup();
var menuService = require('../services/menu.service');
var mediaService = require('../services/media.service');
var siteSettingsService = require('../services/site-settings.service');
var contentService = require('../services/content.service');

// const handler = new moduleService("one");
// console.log(handler.getProject('test123'));

var cors = require('cors');

const chalk = require('chalk');
const log = console.log;

var admin = require(__dirname + '/admin');
const helmet = require('helmet')

module.exports = function (app) {
  var router = app.loopback.Router();

  let page = '';
  let adminPage = '';



  (async () => {
    // page = await themes.getTheme();
    // page = this.contentService.getPage('5cdb5cc2f744441df910f43f', null);
    // console.log('asunc page ==>', page);
    // console.log('emitting startup');
    eventBusService.emit('startup');

    // moduleService.loadModules();

  })();

  (async () => {
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();

    //TODO fix admin path for prod mode
    adminPage = await admin.loadAdmin();
    // console.log('asunc page ==>', page);
  })();

  // app.use(express.static(__dirname + '/public' ));

  // app.use(cors());

  app.get('/hbs', async function (req, res) {
    res.render('home');
  });

  app.get('/test', async function (req, res) {
    res.send('ok');
  });

  // app.get('/sandbox', async function (req, res) {
  //   let sandbox = await contentService.getSandboxPage(req);
  //   console.log('sandbox', sandbox);
  //   res.render('home', await contentService.getSandboxPage(req));
  // });

  app.get('/admin', async function (req, res) {
    res.send(adminPage);
  });

  // router.get('/admin2', function (req, res) {
  //   console.log('admin---')
  //   res.send(adminPage);
  // });

  //home page
  // router.get('/', async function (req, res) {
  //   res.render('home', await contentService.getRenderedPage(req));
  // });



  // router.get('*', async function (req, res) {
  //   // this.page = await contentService.getPage('5cdb5cc2f744441df910f43f', null);
  //   // console.log('page55', this.page);
  //   let url = req.url;
  //   console.log('url get', url);
  //   res.send(url);
  // });

  // router.get('/admin*', function (req, res) {
  //   res.send(adminPage);
  // });



  router.get('/admin/content-types', function (req, res) {
    res.send(adminPage);
  });

  app.get('*', async function (req, res, next) {
    if ( req.url === '/explorer' || req.url.startsWith('/api')
      || req.url.endsWith('.css') || req.url.endsWith('.html') || req.url.endsWith('.ico') || req.url.endsWith('.map') || req.url.endsWith('.js') || req.url.indexOf('fonts') > -1) {
      // log(chalk.blue(req.url));
      return next();
    }

    // formio.getComponents();

    if(req.url.startsWith('/blog/')){
      res.render('blog', await contentService.getBlog(req));
    }
    else{
      res.render('home', await contentService.getRenderedPage(req));
    }

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
  // app.use(helmet.frameguard({
  //   action: 'allow-from',
  //   domain: 'http://localhost:4200'
  // }))

  // app.use(helmet.frameguard({ action: 'sameorigin' }))


  // app.use(helmet.frameguard({ action: 'allow' }))


  // app.use(helmet.frameguard({ action: 'sameorigin' }))



  app.use(router);

};  

