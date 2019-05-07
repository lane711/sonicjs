'use strict';

module.exports = function(Content) {

    Content.getPageById = function (id, cb) {
      Content.findById( id, function (err, instance) {
        var response = "Name of coffee shop is " + instance.data.name;
        console.log(instance);

        cb(null, response);
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
