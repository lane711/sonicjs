'use strict';

module.exports = function(Content) {

    Content.getPageById = function (cb) {
        var response = new Date();
        cb(null, response);
      };
    
      Content.remoteMethod(
        'getPageById', {
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

};
