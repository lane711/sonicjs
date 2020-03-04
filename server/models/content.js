'use strict';
var eventBusService = require('../services/event-bus.service');
var path = require("path");

var contentService = require(path.join(__dirname, '../', 'services/content.service'));


module.exports = function (Content) {

  // Content.beforeRemote('create', function (context, user, next) {
  //   let x = 1;
  // });

  Content.observe('before save', async function filterProperties(ctx, next) {
    if (ctx.options && ctx.options.skipPropertyFilter) return next();
    if (ctx.instance && ctx.instance.data) {
      var date = + new Date()
      ctx.instance.data.createdOn = date;
      ctx.instance.data.updatedOn = undefined;
    }

    await eventBusService.emit('beforeSave', { instance: ctx.instance.data });


    // next();
  });

  Content.getPageById = function (id, cb) {
    Content.findById(id, function (err, instance) {
      contentService.getPage(id, instance).then(html => {
        //  console.log('contentService.getPage', html)
        instance.data.html = html;
        cb(null, instance);
      })
    });
  };

  Content.remoteMethod(
    'getPageById', {
    http: {
      path: '/getPageById',
      verb: 'get',
    },
    accepts: { arg: 'id', type: 'string', http: { source: 'query' } },
    returns: {
      arg: 'data',
      type: 'object',
    }
  }
  );


  Content.uploadMedia = function (id, cb) {
    Content.findById(id, function (err, instance) {
      // var response = `<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph. ${instance.data.name}</p></body></html>`;
      contentService.getPage(id, instance).then(html => {
        instance.data.html = html;
        cb(null, instance);
      })
    });
  };

  Content.remoteMethod(
    'uploadMedia', {
    http: {
      path: '/uploadMedia',
      verb: 'post',
    },
    accepts: { arg: 'file', type: 'string', http: { source: 'query' } },
    returns: {
      arg: 'data',
      type: 'object',
    }
  }
  );

  // CoffeeShop.getName = function(shopId, cb) {
  //   CoffeeShop.findById( shopId, function (err, instance) {
  //       var response = "Name of coffee shop is " + instance.name;
  //       cb(null, response);
  //       console.log(response);
  //   });
  // }

  // CoffeeShop.remoteMethod (
  //       'getName',
  //       {
  //         http: {path: '/getname', verb: 'get'},
  //         accepts: {arg: 'id', type: 'string', http: { source: 'query' } },
  //         returns: {arg: 'name', type: 'string'}
  //       }
  //   );

};
