var pageBuilderService = require("./page-builder.service");
var formService = require("./form.service");
var listService = require("./list.service");
var menuService = require("./menu.service");
var helperService = require("./helper.service");
var dataService = require("./data.service");
var globalService = require("./global.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var eventBusService = require("./event-bus.service");

var loopback = require("loopback");
var app = loopback();
// var User = loopback.User;

module.exports = installerService = {
  startup: async function (app) {
    // this.checkIfAdminAccountIsCreated();

    app.get("/install", async function (req, res) {
      let data = { registerMessage: "<b>admin</b>" };
      res.render("admin-install", { layout: "login.handlebars", data: data });
      return;
    });

    app.post("/install-connection-check", async function (req, res) {
      //TODO, make sure db not already setup
      let dbInfo = req.body;
      installerService.checkConnection(dbInfo);
      res.redirect(`/install?checking`); // /admin will show the login
      return;
    });
  },

  checkConnection: async function (dbInfo) {
    console.log(dbInfo);
  },
};
