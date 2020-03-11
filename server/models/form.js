'use strict';

module.exports = function(Form) {

  Form.status = function (cb) {
    var response = new Date();
    cb(null, response);
  };

  Form.remoteMethod(
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

};
