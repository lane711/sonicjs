var themes = require(__dirname + '../../themes/themes');
var pageBuilderService = require('../services/page-builder.service');
var formio = require('../services/formio.service');
var eventBusService = require('../services/event-bus.service');
var adminService = require('../services/admin.service');
var dataService = require('../services/data.service');
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
var userService = require('../services/user.service');

var cors = require('cors');

const chalk = require('chalk');
const log = console.log;

var admin = require(__dirname + '/admin');

module.exports = function (app) {
  var router = app.loopback.Router();

  let page = '';
  let adminPage = '';


  (async () => {
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();

    //TODO fix admin path for prod mode
    adminPage = await admin.loadAdmin();

    eventBusService.emit('startup');

  })();

  //log a user in
  var user = app.models.User;
  app.post('/login', function (req, res) {
    let email = req.body.email;
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
        } else {
          res.render('response', {
            title: 'Login failed. Wrong username or password',
            content: err,
            redirectTo: '/',
            redirectToLinkText: 'Please login again',
          });
        }
        return;
      }
      res.render('home', {
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/api/users/change-password?access_token=' + token.id
      });
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

  app.get('/admin-ng', async function (req, res) {
    res.send(adminPage);
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
    if (req.url === '/explorer' || req.url.startsWith('/api')
      || req.url.endsWith('.css') || req.url.endsWith('.html') || req.url.endsWith('.ico') || req.url.endsWith('.map')
      || req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.svg')
      || req.url.endsWith('.js') || req.url.indexOf('fonts') > -1 || req.url.indexOf('.woff') > -1) {
      // log(chalk.blue(req.url));

      return next();
    }

    // formio.getComponents();

    if (req.url.startsWith('/blog/')) {
      res.render('blog', await contentService.getBlog(req));
    }
    else if (req.url.startsWith('/admin') && !await userService.isAuthenticated()) {
      let data = {};
      res.render('admin-login', { layout: 'login.handlebars', data: data });
    }
    else if (req.url.startsWith('/admin')) {
      //
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
        data = await adminService.getContent()
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
        data.contentTypeId = param1; //await dataService.getContentType(param)
      }

      if (viewName == "admin-modules") {
        data = await moduleService.getModules();
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

      res.render(viewName, { layout: 'admin.handlebars', data: data });

    }
    else {
      var page = await contentService.getRenderedPage(req);
      res.render('home', page);
    }

  });

  app.use(router);

};

