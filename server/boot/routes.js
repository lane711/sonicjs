var eventBusService = require('../services/event-bus.service');
var globalService = require('../services/global.service');
globalService.startup();
var themes = require(__dirname + '../../themes/themes');
var pageBuilderService = require('../services/page-builder.service');
var formio = require('../services/formio.service');
var adminService = require('../services/admin.service');
adminService.startup();
var dataService = require('../services/data.service');
dataService.startup();
var moduleService = require('../services/module.service')
moduleService.startup();
var formService = require('../services/form.service')
formService.startup();
var menuService = require('../services/menu.service');
var mediaService = require('../services/media.service');
var siteSettingsService = require('../services/site-settings.service');
var contentService = require('../services/content.service');
var cssService = require('../services/css.service');
cssService.startup();
var javascriptService = require('../services/javascript.service');
javascriptService.startup();
var userService = require('../services/user.service');

const path = require("path");
var cors = require('cors');
const chalk = require('chalk');
const log = console.log;

var admin = require(__dirname + '/admin');


module.exports = function (app) {

  // app.get('/', async function (req, res) {
  //   res.send('ok');
  // });  

  var router = app.loopback.Router();

  let page = '';
  let adminPage = '';


  (async () => {
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();
    await userService.startup();

    await eventBusService.emit('startup');

  })();

  app.get('/register', async function (req, res) {
    let data = { registerMessage: "<b>admin</b>" };
    res.render('admin-register', { layout: 'login.handlebars', data: data });
    return;
  });

  app.post('/register', function (req, res) {
    var user = app.models.User;
    user.create({ email: req.body.email, password: req.body.password }, function (err, userInstance) {
      console.log(userInstance);
      globalService.isAdminUserCreated = true;
      res.redirect('/admin'); // /admin will show the login
      return;
    });
  });

  //log a user in
  app.post('/login', function (req, res) {
    var user = app.models.User;
    user.login({
      email: req.body.email,
      password: req.body.password
    }, 'user', function (err, token) {
      if (err) {
        if (err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
          res.render('reponseToTriggerEmail', {
            title: 'Login failed',
            content: err,
            redirectToEmail: '/api/users/' + err.details.userId + '/verify',
            redirectTo: '/',
            redirectToLinkText: 'Click here',
            userId: err.details.userId
          });
        } else if(err.code ==='USERNAME_EMAIL_REQUIRED'){
          res.redirect('/login');
        }
        else {
          res.redirectTo()
        }
        return;
      }

      //set cookie
      res.cookie('sonicjs_access_token', token.id, { signed: true, maxAge: 30000000 });
      let referer = req.headers.referer;
      res.redirect(referer);
    });
  });

  //log a user out
  app.get('/logout', function (req, res, next) {
    var user = app.models.User;
    var token = req.signedCookies.sonicjs_access_token;
    if (!token) return res.sendStatus(401);
    user.logout(token, function (err) {
      if (err) return next(err);
      res.clearCookie('sonicjs_access_token');
      res.redirect('/admin');
    });
  });

  app.get('/hbs', async function (req, res) {
    res.render('home');
  });

  app.get('/sandbox', async function (req, res) {
    let data = {};
    res.render('sandbox', { layout: 'blank.handlebars', data: data });
  });

  app.get('/admin/sandbox', async function (req, res) {
    let data = {};
    res.render('sandbox', { layout: 'admin.handlebars', data: data });
  });

  app.get('/test', async function (req, res) {
    res.send('ok');
  });

  app.get('/css/generated.css', async function (req, res) {
    res.set('Content-Type', 'text/css');
    let css = await cssService.getGeneratedCss();
    res.send(css);
  });

  // router.get('/admin/content-types', function (req, res) {
  //   res.send(adminPage);
  // });

  app.get('*', async function (req, res, next) {

    if (!globalService.isAdminUserCreated && (req.url === '/' || req.url === '/admin')) {
      //brand new site, admin accounts needs to be created
      res.redirect('/register');
      return;
    }

    //for modules css/js files
    if ((req.url.endsWith('.css') || req.url.endsWith('.js')) && req.url.startsWith('/modules/')) {
      let cssFile = path.join(__dirname, '..', req.url);
      // res.set('Content-Type', 'text/css');
      res.sendFile(cssFile);
      return;
    }

    if (req.url === '/explorer' || req.url.startsWith('/api')
      || req.url.endsWith('.css') || req.url.endsWith('.html') || req.url.endsWith('.ico') || req.url.endsWith('.map')
      || req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.svg')
      || req.url.endsWith('.js') || req.url.indexOf('fonts') > -1 || req.url.indexOf('.woff') > -1) {
      // log(chalk.blue(req.url));

      return next();
    }

    if (process.env.MODE == 'production') {
      console.log(`serving: ${req.url}`);
    }

    await eventBusService.emit('requestBegin', { req: req, res: res });

    // formio.getComponents();

    if (req.url.startsWith('/blog/')) {
      let page = await contentService.getBlog(req);
      res.render('blog', page);
    }
    else if (req.url.startsWith('/admin') && !await userService.isAuthenticated(req)) {

      if (process.env.MODE !== 'dev') {
        res.send(401);
      }

      let data = {};
      res.render('admin-login', { layout: 'login.handlebars', data: data });
    }
    else if (req.url.startsWith('/admin')) {
      //

      if (process.env.MODE !== 'dev') {
        res.send(401);
      }

      let path = req.url.split("/");
      let viewName = "admin-dashboard";
      let param1 = null;
      let param2 = null;

      if (path[2]) {
        viewName = "admin-" + path[2];
      }
      if (path[3]) {
        viewName += "-" + path[3];
      }
      if (path[4]) {
        param1 = path[4];
      }
      if (path[5]) {
        param2 = path[5];
      }

      let data = {};

      if (viewName == "admin-content") {
        data = await dataService.getContent()
        data.contentTypes = await dataService.getContentTypes()
      }

      if (viewName == "admin-content-edit") {
        let content = null;
        if (param2) {
          content = await dataService.getContentById(param2);
        }
        data.editForm = await formService.getForm(param1, content);
      }

      if (viewName == "admin-content-types") {
        data = await dataService.getContentTypes()
      }

      if (viewName == "admin-content-types-edit") {
        data.contentTypeId = param1;
      }

      if (viewName == "admin-modules") {
        data = await moduleService.getModules();
      }

      if (viewName == "admin-modules-edit") {
        data.contentTypeId = param1;
      }

      if (viewName == "admin-media") {
        data = await mediaService.getMedia()
      }

      if (viewName == "admin-menus") {
        data = await dataService.getContentByContentType('menu')
      }

      if (viewName == "admin-site-settings") {
        data = await dataService.getContentTopOne('site-settings');
        data.editForm = await formService.getForm('site-settings', data);
      }

      if (viewName == "admin-site-settings-colors") {
        data = await dataService.getContentTopOne('site-settings-colors');
        data.editForm = await formService.getForm('site-settings-colors', data);
      }

      if (viewName == "admin-site-settings-typography") {
        data = await dataService.getContentTopOne('site-settings');
        data.editForm = await formService.getForm('site-settings', data);
      }

      let accessToken = await userService.getToken(req)

      res.render(viewName, { layout: 'admin.handlebars', data: data, accessToken: accessToken });

    }
    else {
      var page = await contentService.getRenderedPage(req);
      res.render('home', page);
    }

  });

  app.use(router);

};

