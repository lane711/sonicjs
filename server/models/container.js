// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-example-storage

module.exports = function(Container) {

  // Container.beforeRemote('*', function(ctx, file, next) {
  //   let width = ctx.req.query.width;
  //   console.log('file has been saved', width, file);
  //   next();
  // });

//   Container.observe('findOrCreate', async function filterProperties(ctx, next) {
//     // if (ctx.options && ctx.options.skipPropertyFilter) return next();
//     // if (ctx.instance && ctx.instance.data) {
//     //   var date = + new Date()
//     //   ctx.instance.data.createdOn = date;
//     //   ctx.instance.data.updatedOn = undefined;
//     // }

//     // await eventBusService.emit('beforeSave', { instance: ctx.instance.data });
// console.log(ctx);

//     next();
//   });

//   Container.observe('access', function logQuery(ctx, next) {
//     console.log('Accessing %s matching %s', ctx.Model.modelName, ctx.query.where);
//     next();
//   });

//   Container.observe('before save', async function(ctx) {
//     console.log('before save', ctx)
//     return;
//   });

//   Container.observe('loaded', async function(ctx) {
//     console.log('loaded', ctx)
//     return;
//   });


//   Container.processImage = function (container, file, cb) {
//     console.log('proc image');
//     Container.findById(id, function (err, instance) {
//               //  console.log('contentService.getPage', html)
//               cb(null, instance);

//       // contentService.getPage(id, instance).then(html => {
//       //   //  console.log('contentService.getPage', html)
//       //   instance.data.html = html;
//       //   cb(null, instance);
//       // })
//     });
//   };

//   Container.remoteMethod(
//     'processImage', {
//     http: {
//       path: '/{container}/images/{file}',
//       verb: 'get',
//     },
//     accepts: [{ arg: 'container', type: 'string', http: { source: 'path' } },
//               { arg: 'file', type: 'string', http: { source: 'path' } }],
//     returns: {
//       arg: 'data',
//       type: 'object',
//     }
//   }
//   );

//     Container.images = function(file, cb) {
//       console.log('downloading...', file);
//       // getTheStreamBody() can be implemented by calling http.request() or fs.readFile() for example
//       // getTheStreamBody(function(err, stream) {
//       //   if (err) return cb(err);
//       //   // stream can be any of: string, buffer, ReadableStream (e.g. http.IncomingMessage)
//       //   cb(null, stream, 'application/octet-stream');
//       // });
//       cb(null, undefined, 'application/octet-stream');

//     };

//     Container.remoteMethod('download', {
//       http: {
//         path: '/images',
//         verb: 'get',
//       },
//       returns: [
//         {arg: 'body', type: 'file', root: true},
//         {arg: 'Content-Type', type: 'string', http: { target: 'header' }}
//       ],
//       accepts: { arg: 'file', type: 'string', http: { source: 'query' } },
//     });

//     Container.download2 = function(cb) {
//       // getTheStreamBody() can be implemented by calling http.request() or fs.readFile() for example
//       getTheStreamBody(function(err, stream) {
//         if (err) return cb(err);
//         // stream can be any of: string, buffer, ReadableStream (e.g. http.IncomingMessage)
//         cb(null, stream, 'application/octet-stream');
//       });
//     };

//     Container.remoteMethod('download2', {
//       returns: [
//         {arg: 'body', type: 'file', root: true},
//         {arg: 'Content-Type', type: 'string', http: { target: 'header' }}
//       ]
//     });

//     Container.getName = function (id, cb) {
//       // Container.findById(id, function (err, instance) {
//         var response = 'Name of coffee shop is ' + id;
//         cb(null, response);
//       // });
//     };

//     Container.remoteMethod(
//       'getName', {
//         http: {
//           path: '/getname',
//           verb: 'get',
//         },
//         accepts: {
//           arg: 'id',
//           type: 'string',
//           http: {
//             source: 'query',
//           },
//         },
//         returns: {
//           arg: 'name',
//           type: 'string',
//         },
//       }
//     );


  // Container.uploadMedia = function (id, cb) {
  //   Content.findById(id, function (err, instance) {
  //     // var response = `<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph. ${instance.data.name}</p></body></html>`;
  //     contentService.getPage(id, instance).then(html => {
  //       instance.data.html = html;
  //       cb(null, instance);
  //     })
  //   });
  // };

  // Container.remoteMethod(
  //   'uploadMedia', {
  //   http: {
  //     path: '/{container}/images/{file}',
  //     verb: 'get',
  //   },
  //   accepts: { arg: 'file', type: 'string', http: { source: 'query' } },
  //   returns: {
  //     arg: 'data',
  //     type: 'object',
  //   }
  // }
  // );

};
