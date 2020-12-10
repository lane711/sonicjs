const fs = require("fs");
initEnvFile();
require("dotenv").config();
const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./server/schema/schema");
const app = express();
const { request, gql } = require("graphql-request");
const path = require("path");
const chalk = require("chalk");
// var express = require("express");
var exphbs = require("express-handlebars");
var Handlebars = require("handlebars");
var globalService = require("./server/services/global.service");
const routes = require("./server/boot/routes.js");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once("open", () => {
  console.log("conneted to database");
});

//This route will be used as an endpoint to interact with Graphql,
//All queries will go through this route.
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

app.get("/", async function (req, res) {
  res.send('ok');
});

// app.get("/", async function (req, res) {
//   const query = gql`
//   {
//     authors{
//       id
//       name
//       book{
//         name
//         pages
//       }
//     }
//     }
//   `;
//   request("http://localhost:3000/graphql", query).then((data) =>{
//     console.log(data);
//   res.send('ok');
//   }
//   );

// });

// app.listen(3000, () => {
//   console.log("Listening on port 3000");
// });


// -------------------

// "use strict";

// var loopback = require("loopback");
// var boot = require("loopback-boot");

// const { start } = require("repl");

const frontEndTheme = `${process.env.FRONT_END_THEME}`
const adminTheme = `${process.env.ADMIN_THEME}`
// var bodyParser = require('body-parser');

// var app = (module.exports = loopback());

function start () {
  //set view engine
  // app.engine('handlebars', exphbs());
  // app.set('view engine', 'handlebars');

  let themeDirectory = path.join(__dirname, "themes");
  // console.log('themeDirectory', themeDirectory);

  ///Users/lanecampbell/Dev/sonicjs/server/themes/front-end/dark/partials
  let partialsDirs = [
    path.join(__dirname, "themes", "front-end", "bootstrap", "partials"),
    path.join(__dirname, "themes", "front-end", frontEndTheme, "partials"),
    path.join(__dirname, "themes", "admin", adminTheme, "partials"),
    path.join(__dirname, "themes", "admin", "shared-partials"),
  ];
  // console.log('partialsDirs', partialsDirs);

  ///Users/lanecampbell/Dev/sonicjs/server/themes/theme1/theme1.handlebars
  // app.set('layoutsDir', themeDirectory);

  var hbs = exphbs.create({
    layoutsDir: path.join(themeDirectory),
    partialsDir: partialsDirs,
  });

  // Register `hbs.engine` with the Express app.
  app.engine("handlebars", hbs.engine);
  app.set("view engine", "handlebars");
  app.set("views", __dirname + "/themes");

  // app.set('view options', { layout: 'dark/dark' });

  // Parse URL-encoded bodies (as sent by HTML forms)
  // app.use(express.urlencoded());
  // app.use(express.bodyParser());

  // configure body parser
  // app.use(bodyParser.urlencoded({ extended: true }));

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
    json: function(context){
      return JSON.stringify(context);
    },
  });

  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());

  // app.use(loopback.token({ model: app.models.accessToken }));
  // app.use(loopback.token());

  // start the web server
  // return app.listen(function () {
  //   app.emit("started");

  //   var baseUrl = 'http://localhost:3019'; //app.get("url").replace(/\/$/, "");
  //   globalService.baseUrl = baseUrl;

  //   console.log(chalk.cyan("Website at: ", baseUrl));
  //   console.log(chalk.cyan("Admin console at: ", baseUrl + "/admin"));
  //   console.log(chalk.cyan("GraphQL API at: ", baseUrl + "/graphql"));

  //   // if (app.get("loopback-component-explorer")) {
  //   //   var explorerPath = app.get("loopback-component-explorer").mountPath;
  //   //   console.log(chalk.cyan("REST API at: ", baseUrl + explorerPath));
  //   // }
  // });

  routes.loadRoutes(app);

  app.listen(3019, () => {
    var baseUrl = 'http://localhost:3019'; //app.get("url").replace(/\/$/, "");
    globalService.baseUrl = baseUrl;

    console.log(chalk.cyan("Website at: ", baseUrl));
    console.log(chalk.cyan("Admin console at: ", baseUrl + "/admin"));
    console.log(chalk.cyan("GraphQL API at: ", baseUrl + "/graphql"));

    

});

};

function initEnvFile() {
  const path = "./.env";

  try {
    if (!fs.existsSync(path)) {
      //create default env file
      fs.copyFile(".env-default", ".env", (err) => {
        if (err) throw err;
        console.log(".env-default was copied to .env");
      });
    }
  } catch (err) {
    console.error(err);
  }
}


start();