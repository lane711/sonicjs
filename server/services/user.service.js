var dataService = require("./data.service");
var helperService = require("./helper.service");
var eventBusService = require("./event-bus.service");
var globalService = require("./global.service");
var loopback = require("loopback");
var app = loopback();
var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;

module.exports = userService = {
  startup: function () {
    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options) {
        options.page.data.showPageBuilder = await userService.isAuthenticated(
          options.req
        );
      }
    });
  },

  getUsers: async function () {
    var userModel = loopback.getModel("user");
    let users = await userModel.find();
    console.log(users);
    return users;
  },

  getCurrentUserId: async function (req) {
    if (req.signedCookies && req.signedCookies.sonicjs_access_token) {
      let tokenInfo = await globalService.AccessToken.findById(
        req.signedCookies.sonicjs_access_token
      );
      if (tokenInfo && tokenInfo.userId) {
        return tokenInfo.userId;
      }
    }
  },

  getCurrentUser: async function (req) {
    var userModel = loopback.getModel("user");
    let a = app;
    let userId = await userService.getCurrentUserId(req);
    if (userId) {
      let user = await userModel.findById(userId);
      if (user) {
        return user;
      }
    }
  },

  isAuthenticated: async function (req) {
    var authCookie = await this.getToken(req);
    let userId = await userService.getCurrentUserId(req);
    if (authCookie && userId) {
      return true;
    }
    return false;
  },

  getToken: async function (req) {
    return req.signedCookies.sonicjs_access_token;
  },
};
