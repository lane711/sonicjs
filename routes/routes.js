if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require) {
  var express = require('express');
  var router = express.Router();
  var routes = {};
  
  routes.index = function(req, res) {
    res.render('index', { title: 'Express' });
  };


  
  return routes;
});