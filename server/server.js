'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
const chalk = require('chalk');
var express = require('express');
var exphbs = require('express-handlebars');

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


  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log(chalk.cyan('Website at: ', baseUrl));
    console.log(chalk.cyan('Admin console at: ', baseUrl + '/admin'));

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log(chalk.cyan('REST API at: ', baseUrl, explorerPath));
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
