'use strict';
const fs = require('fs')
initEnvFile();
require('dotenv').config();
var globalService = require('./services/global.service');

var loopback = require('loopback');
var boot = require('loopback-boot');
const chalk = require('chalk');
var express = require('express');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');

// var bodyParser = require('body-parser');

var app = module.exports = loopback();


app.start = function () {



  //set view engine
  // app.engine('handlebars', exphbs());
  // app.set('view engine', 'handlebars');
  var hbs = exphbs.create({ /* config */ });

  // Register `hbs.engine` with the Express app.
  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');
  app.set('views', __dirname + '/views');


  // Parse URL-encoded bodies (as sent by HTML forms)
  // app.use(express.urlencoded());
  // app.use(express.bodyParser());


    // configure body parser
    // app.use(bodyParser.urlencoded({ extended: true }));


    Handlebars.registerHelper({
      eq: function (v1, v2) {
          return v1 === v2;
      },
      ne: function (v1, v2) {
          return v1 !== v2;
      },
      lt: function (v1, v2) {
          return v1 < v2;
      },
      gt: function (v1, v2) {
          return v1 > v2;
      },
      lte: function (v1, v2) {
          return v1 <= v2;
      },
      gte: function (v1, v2) {
          return v1 >= v2;
      },
      and: function () {
          return Array.prototype.slice.call(arguments).every(Boolean);
      },
      or: function () {
          return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
      }
  });



  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());

  // app.use(loopback.token({ model: app.models.accessToken }));
  app.use(loopback.token());


  // start the web server
  return app.listen(function () {
    app.emit('started');

    var baseUrl = app.get('url').replace(/\/$/, '');
    globalService.baseUrl = baseUrl;

    console.log(chalk.cyan('Website at: ', baseUrl));
    console.log(chalk.cyan('Admin console at: ', baseUrl + '/admin'));


    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log(chalk.cyan('REST API at: ', baseUrl + explorerPath));
    }
  });
};

function initEnvFile() {
  const path = './.env'

  try {
    if (!fs.existsSync(path)) {
      //create default env file
      fs.copyFile('.env-default', '.env', (err) => {
        if (err) throw err;
        console.log('.env-default was copied to .env');
      });
    }
  } catch(err) {
    console.error(err)
  }
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

