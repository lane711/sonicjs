'use strict';

module.exports = function(Formio) {

  Formio.status = function (cb) {
    var response = new Date();
    cb(null, response);
  };

  Formio.remoteMethod(
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

  Formio.form = function (cb) {
    let forms = [{_id: '123', type: 'form', title: 'my form'},{_id: '324', type: 'form', title: 'my form 2'}]
    cb(null, forms);
  };

  Formio.remoteMethod(
    'form', {
      http: {
        path: '/form',
        verb: 'get',
      },
      returns: {
        arg: '',
        type: 'string',
      },
    }
  );

  // Formio.form = function (cb) {
  //   let forms = [{id: '123', title: 'my form'},{id: '324', title: 'my form 2'}]
  //   cb(null, forms);
  // };

  // Formio.form(
  //   'form', {
  //     http: {
  //       path: '/form',
  //       verb: 'get',
  //     },
  //     returns: {
  //       arg: 'status',
  //       type: 'string',
  //     },
  //   }
  // );

};
