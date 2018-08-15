var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require
});


/**
 * Load dependencies and start Express
 * @see http://expressjs.com/guide.html
 */
requirejs(['http', 'path', 'express', './routes/routes', 'axios', 'mongoose', 'body-parser', 'express-handlebars'],
  function (http, path, express, routes, axios, mongoose, bodyParser, exhbs) {
    var app = express();
    var router = express.Router();

    app.engine('hbs', exhbs({
      extname: 'hbs',
      defaultLayout: 'layout',
      layoutsDir: __dirname + '/views/layouts/',
      partialsDir: [__dirname + '/views/admin/partials/',
                    __dirname + '/views/admin/content-types/partials/',
                    __dirname + '/views/admin/field-types/partials/'],
      helpers: {
        sayHello: function () {
          return true;
        },
        getStringifiedJson: function (value) {
          return JSON.stringify(value);
        },
        ifCond: function (v1, operator, v2, options) {
          console.log('v1:' + v1);
          switch (operator) {
            case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
              return options.inverse(this);
          }
        }
      }
    }));

    app.set('port', process.env.PORT || 3009);
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({
      extended: false
    })); // parse application/x-www-form-urlencoded
    app.use(bodyParser.json()); // parse application/json
    app.use('/js/jquery.js', express.static('node_modules/jquery/jquery.min.js'));
    app.use('/js/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'));
    app.use('/js/popper.js', express.static('node_modules/popper.js/dist/umd/popper.js'));
    app.use('/js/vue.js', express.static('node_modules/vue/dist/vue.min.js'));
    app.use('/js/require.js', express.static('node_modules/requirejs/require.js'));
    app.use('/js/axios.js', express.static('node_modules/axios/dist/axios.min.js'));
    app.use('/js/perfect-scrollbar.js', express.static('node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js'));
    app.use('/js/coreui.js', express.static('node_modules/@coreui/coreui/dist/js/coreui.min.js'));
    app.use('/js/vue-form-generator.js', express.static('node_modules/vue-form-generator/dist/vfg.js'));


    app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.min.css'));
    app.use('/css/font-awesome.min.css', express.static('node_modules/font-awesome/css/font-awesome.min.css'));
    app.use('/css/simple-line-icons.css', express.static('node_modules/simple-line-icons/css/simple-line-icons.css'));

    app.get('/', routes.index);
    require('./routes/api')(app, mongoose); //load api routes
    require('./routes/admin')(app);
    require('./routes/page')(app, mongoose); //page routes using 404 catch all

    // reload(app);
    http.createServer(app).listen(app.get('port'), function () {

      console.log("Express server listening on port " + app.get('port'));
    });

  });