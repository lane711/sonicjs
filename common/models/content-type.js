'use strict';

module.exports = function (Contenttype) {
  Contenttype.status = function (cb) {
    var response = new Date();
    cb(null, response);
  };

  Contenttype.remoteMethod(
    'status', {
      http: {
        path: '/status',
        verb: 'get',
      },
      returns: {
        arg: 'status',
        type: 'string',
      },
    }
  );

  Contenttype.getName = function (id, cb) {
    Contenttype.findById(id, function (err, instance) {
      var response = 'Name of coffee shop is ' + instance.name;
      cb(null, response);
    });
  };

  Contenttype.remoteMethod(
    'getName', {
      http: {
        path: '/getname',
        verb: 'get',
      },
      accepts: {
        arg: 'id',
        type: 'string',
        http: {
          source: 'query',
        },
      },
      returns: {
        arg: 'name',
        type: 'string',
      },
    }
  );

  
};
