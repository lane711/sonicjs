const fs = require("fs");
initEnvFile();
require("dotenv").config();
const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./server/schema/schema");
const session = require("express-session");
const app = express();
const { request, gql } = require("graphql-request");
const path = require("path");
const chalk = require("chalk");
const _ = require("lodash");
// var FileStore = require("session-file-store")(session);
var exphbs = require("express-handlebars");
var Handlebars = require("handlebars");
var logSymbols = require("log-symbols");
var globalService = require("./server/services/global.service");
var installService = require("./server/services/install.service");
var helperService = require("./server/services/helper.service");
initInstallIdFile();

const routes = require("./server/boot/routes.js");
var appRoot = require("app-root-path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const port = `${process.env.PORT}`;
const frontEndTheme = `${process.env.FRONT_END_THEME}`;
const adminTheme = `${process.env.ADMIN_THEME}`;

const passport = require("passport");
LocalStrategy = require("passport-local").Strategy;

const typeorm = require("typeorm");
const { getConnection } = require("typeorm");
const { TypeormStore } = require("connect-typeorm");

const { Session } = require("./server/data/model/Session");
const { stringify } = require("yaml");

function start() {
  setupStaticAssets(app);

  //1.2 handlebars
  setupHandlebars(app);

  // 1 cookieParser
  app.use(cookieParser());

  // 1.5 body parser
  // app.use(express.bodyParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: "100mb" }));

  // 2 session
  // setupSessionFile(app);
  setupSessionDb(app);

  // 3 passport.initialize & 4 passport.session
  setupPassport(app);

  //4.5 graphql?
  setupGraphQL(app);

  // 5 app.router
  routes.loadRoutes(app);

  appListen(app);
}

function appListen(app) {
  app.listen(port, () => {
    var baseUrl = `http://localhost:${port}`;
    globalService.baseUrl = baseUrl;

    console.log(chalk.cyan("Website at: ", baseUrl));
    console.log(chalk.cyan("Admin console at: ", baseUrl + "/admin"));
    console.log(chalk.cyan("GraphQL API at: ", baseUrl + "/graphql"));

    app.emit("started");

    installService.checkInstallation(app);
  });
}

function setupSessionDb(app) {
  const sessionRepo = getConnection().getRepository(Session);

  let sessionLengthDays = process.env.SESSION_LENGTH_DAYS
    ? process.env.SESSION_LENGTH_DAYS
    : 14;

  app.use(
    session({
      name: "sonicjs",
      cookie: { secure: false },
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 5,
        limitSubquery: false, // If using MariaDB - see https://github.com/nykula/connect-typeorm/issues/8
        ttl: 86400 * sessionLengthDays,
      }).connect(sessionRepo),
    })
  );
}

function setupPassport(app) {
  passport.use(
    new LocalStrategy(async function (email, password, done) {
      let loginUser = await dalService.userGetByLogin(email, password);
      if (loginUser) {
        console.log("logging in:", loginUser.username);
      } else {
        console.log("Invalid login");
      }
      return done(null, loginUser);
    })
  );

  passport.serializeUser(function (user, done) {
    // console.log('serializeUser', user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    // console.log('deserializeUser', user);
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
}

function setupGraphQL(app) {
  app.use(
    "/graphql",
    graphqlHTTP({
      //Directing express-graphql to use this schema to map out the graph
      schema,
      //Directing express-graphql to use graphiql when goto '/graphql' address in the browser
      //which provides an interface to make GraphQl queries
      graphiql: true,
    })
  );
}

function initEnvFile() {
  const path = "./.env";

  try {
    if (!fs.existsSync(path)) {
      //create default env file
      fs.copyFile(".env-default", ".env", (err) => {
        if (err) {
          console.log("initEnvFile error");
          throw err;
        }
        console.log(".env-default was copied to .env");
      });
    }
  } catch (err) {
    console.log("initEnvFile catch error");
    console.error(err);
  }
}

function initInstallIdFile() {
  const path = "./server/data/config/installId.json";

  try {
    if (!fs.existsSync(path)) {
      //create default install id file
      let content = JSON.stringify({
        installId: helperService.generateRandomString(8),
      });
      fs.writeFile(path, content, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  } catch (err) {
    console.log("initEnvFile catch error");
    console.error(err);
  }
}

function setupHandlebars(app) {
  let themeDirectory = path.join(__dirname, "server/themes");
  let partialsDirs = [
    path.join(__dirname, "server/themes", "front-end", "bootstrap", "partials"),
    path.join(
      __dirname,
      "server/themes",
      "front-end",
      frontEndTheme,
      "partials"
    ),
    path.join(__dirname, "server/themes", "admin", adminTheme, "partials"),
    path.join(__dirname, "server/themes", "admin", "shared-partials"),
  ];

  var hbs = exphbs.create({
    layoutsDir: path.join(themeDirectory),
    partialsDir: partialsDirs,
    extname: ".hbs",
  });

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
  app.set("views", __dirname + "/server/themes");

  setupHandlebarsHelpers();
}

function setupHandlebarsHelpers() {
  Handlebars.registerHelper({
    eq: function (v1, v2) {
      return v1 === v2;
    },
    ne: function (v1, v2) {
      return v1 !== v2;
    },
    lt: function (v1, v2) {
      return v1 < v2;
    },
    gt: function (v1, v2) {
      return v1 > v2;
    },
    lte: function (v1, v2) {
      return v1 <= v2;
    },
    gte: function (v1, v2) {
      return v1 >= v2;
    },
    and: function () {
      return Array.prototype.slice.call(arguments).every(Boolean);
    },
    or: function () {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    json: function (context) {
      return JSON.stringify(context);
    },
    comparerow: function (row, column) {
      let cms = _.camelCase(column.title);
      return row[cms] ? "fa-check text-success" : "fa-times text-danger";
    },
  });
}

function setupStaticAssets(app) {
  app.use(express.static("server/storage/css"));
  app.use("/themes", express.static(path.join(appRoot.path, "server/themes")));
  app.use(
    "/node_modules",
    express.static(path.join(appRoot.path, "node_modules"))
  );
  app.use(
    "/vendors",
    express.static(path.join(appRoot.path, "server/assets/vendors"))
  );
  app.use(
    "/css",
    express.static(path.join(appRoot.path, "server/storage/css"))
  );
  app.use("/js", express.static(path.join(appRoot.path, "server/storage/js")));
  app.use(
    "/js",
    express.static(path.join(appRoot.path, "server/storage/files"))
  );
  app.use(
    "/sonicjs-services",
    express.static(path.join(appRoot.path, "server/services"))
  );
  app.use(
    "/page-builder",
    express.static(path.join(appRoot.path, "server/page-builder"))
  );
  app.use("/assets", express.static(path.join(appRoot.path, "server/assets")));
  app.use(
    "/api/containers/files/download",
    express.static(path.join(appRoot.path, "server/storage/files"))
  );
  app.use(
    "/assets/fonts",
    express.static(path.join(appRoot.path, "node_modules/font-awesome/fonts"))
  );
  app.use(
    "/assets/css/fonts",
    express.static(path.join(appRoot.path, "node_modules/bootstrap-icons/font/fonts"))
  );
  app.use(
    "/",
    express.static(
      path.join(appRoot.path, "/node_modules/ace-builds/src-min-noconflict")
    )
  );
}

function main() {
  let sslParam = { rejectUnauthorized: false };

  if (process.env.LOCAL_DEV && process.env.LOCAL_DEV == "true") {
    sslParam = false;
  }

  let connectionSettings = {
    url: process.env.DATABASE_URL,
    type: process.env.TYPEORM_CONNECTION,
    entities: ["server/data/entity/*.js"],
    synchronize: process.env.TYPEORM_SYNCHRONIZE,
    logging:process.env.TYPEORM_LOGGING,
    ssl: sslParam,
  };

  if (process.env.TYPEORM_CONNECTION === "sqlite") {
    connectionSettings.database = process.env.TYPEORM_DATABASE;
  }

  if (process.env.TYPEORM_CONNECTION === "mysql") {
    connectionSettings.host = process.env.TYPEORM_HOST;
    connectionSettings.port = process.env.TYPEORM_PORT;
    connectionSettings.username = process.env.TYPEORM_USERNAME;
    connectionSettings.password = process.env.TYPEORM_PASSWORD;
    connectionSettings.database = process.env.TYPEORM_DATABASE;
  }

  typeorm.createConnection(connectionSettings).then((connection) => {
    console.log(logSymbols.success, "Successfully connected to Database!");
    start();
  });
}

main();



