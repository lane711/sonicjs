var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
var listService = require(".//list.service");
var menuService = require(".//menu.service");
var helperService = require(".//helper.service");
var dataService = require(".//data.service");
var globalService = require(".//global.service");

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

module.exports = adminService = {
  startup: async function () {
    this.checkIfAdminAccountIsCreated();

    // eventBusService.on('requestBegin', async function (options) {
    //     adminService.checkIfAdminAccountIsCreated();
    // });
  },

  checkIfAdminAccountIsCreated: async function () {
    var User = loopback.User;

    await User.findById(1, function (err, adminUser) {
      if (err) {
        console.log(err);
      }
      if (adminUser) {
        globalService.isAdminUserCreated = true;
      } else {
        globalService.isAdminUserCreated = false;
      }
    });
  },
};
