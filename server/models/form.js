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

  Form.nestedForms = function (cb) {
    let forms = [{id: '123', title: 'my form'},{id: '324', title: 'my form 2'}]
    cb(null, forms);
  };

  Form.remoteMethod(
    'nestedForms', {
      http: {
        path: '/nestedForms',
        verb: 'get',
      },
      returns: {
        arg: 'status',
        type: 'string',
      },
    }
  );


};
