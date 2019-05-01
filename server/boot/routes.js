// var fs = require('fs');

// module.exports = function(app) {
//     // Install a "/ping" route that returns "pong"
//   app.get('/ping', function(req, res) {
//     res.send('pong');
//   });
// };

// module.exports = function(app) {
//   var router = app.loopback.Router();
//   router.get('/ping2', function(req, res) {
//       res.send('pongaroo');
//     });
//   app.use(router);
// };

// module.exports = function(app) {
//   var router = app.loopback.Router();

//   let page = 'my page';
//   fs.readFile( __dirname + '/assets/html/index.html', function (err, data) {
//     if (err) {
//       throw err; 
//     }
//     page = data.toString();
//   });

//   router.get('/', function(req, res) {
//     let url = req.url;
//       res.send(page);
//     }); 
//   app.use(router);
// }; 