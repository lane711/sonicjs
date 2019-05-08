'use strict';
var contentService = require(__dirname + '/../services/content.service');

module.exports = function(Content) {

    Content.getPageById = function (id, cb) {
      Content.findById( id, function (err, instance) {
        // var response = `<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph. ${instance.data.name}</p></body></html>`;
        contentService.getTheme().then(data => {
          cb(null, data.name);
        })
    });
      };
    
      Content.remoteMethod(
        'getPageById', {
          http: {
            path: '/getPageById',
            verb: 'get',
          },
          accepts: {arg: 'id', type: 'string', http: { source: 'query' } },
          returns: {
            arg: 'name',
            type: 'string',
          },
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
