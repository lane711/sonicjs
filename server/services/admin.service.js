var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
var listService = require(".//list.service");
var menuService = require(".//menu.service");
var helperService = require(".//helper.service");
var dataService = require(".//data.service");
var globalService = require(".//global.service");
const connectEnsureLogin = require("connect-ensure-login");
var dataService = require(".//data.service");
var userService = require(".//user.service");
var breadcrumbsService = require("../services/breadcrumbs.service");

var emitterService = require("./emitter.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var _ = require("underscore");
const { registerPrompt } = require("inquirer");

const adminTheme = `${process.env.ADMIN_THEME}`;
const adminDomain = process.env.ADMIN_DOMAIN;
// var loopback = require("loopback");
// var app = loopback();
// var User = loopback.User;

module.exports = adminService = {
  startup: async function (app) {
    this.checkIfAdminAccountIsCreated();

    app.get(
      "/admin*",
      connectEnsureLogin.ensureLoggedIn(),
      async function (req, res) {
        // if (!req.signedCookies.sonicjs_access_token) {
        //   //user not logged in
        // }

        if (process.env.MODE !== "dev") {
          if (adminDomain !== req.host) {
            res.send(401);
            return;
          }
        }

        globalService.setAreaMode(true, false, true);

        let path = req.url.split("/");
        let viewName = "admin-dashboard";
        let param1 = null;
        let param2 = null;

        if (path[2]) {
          viewName = "admin-" + path[2];
        }
        if (path[3]) {
          viewName += "-" + path[3];
        }
        if (path[4]) {
          param1 = path[4];
        }
        if (path[5]) {
          param2 = path[5];
        }

        let data = {};

        if (viewName == "admin-content") {
          data = await dataService.getContentAdmin();
          data.contentTypes = await dataService.contentTypesGet();
        }

        if (viewName == "admin-content-edit") {
          let content = null;
          if (param2) {
            content = await dataService.getContentById(param2);
          }
          data.editForm = await formService.getForm(
            param1,
            content,
            "submitContent(submission)"
          );
          data.contentId = param2;
        }

        if (viewName == "admin-content-types") {
          let dataRaw = await dataService.contentTypesGet();
          data = _.sortBy(dataRaw, "title");
        }

        if (viewName == "admin-content-types-edit") {
          data.contentTypeId = param1;
          data.raw = await dataService.contentTypeGet(param1);
        }

        if (viewName == "admin-modules") {
          data = await moduleService.getModules();
        }

        if (viewName == "admin-modules-edit") {
          data.moduleSystemId = param1;
          data.contentTypes = await moduleService.getModuleContentTypesAdmin(
            param1
          );
          data.contentTypeId = param1;
          data.moduleDef = await moduleService.getModuleDefinition(param1);
        }

        if (viewName == "admin-media") {
          data = await mediaService.getMedia();
        }

        if (viewName == "admin-menus-edit") {
          if (param1) {
            data = await dataService.getContentById(param1);
            if (data.data.links) {
              data.data.linksString = JSON.stringify(data.data.links);
            }
          }
        }

        if (viewName == "admin-menus") {
          data = await dataService.getContentByContentType("menu");
        }

        if (viewName == "admin-site-settings") {
          data = await dataService.getContentTopOne("site-settings");
          data.editForm = await formService.getForm("site-settings", data);
        }

        if (viewName == "admin-theme-settings") {
          data = await dataService.getContentTopOne("theme-settings");
          data.editForm = await formService.getForm("theme-settings", data);
        }

        if (viewName == "admin-site-settings-colors") {
          data = await dataService.getContentTopOne("site-settings-colors");
          data.editForm = await formService.getForm(
            "site-settings-colors",
            data
          );
        }

        if (viewName == "admin-site-settings-typography") {
          data = await dataService.getContentTopOne("site-settings");
          data.editForm = await formService.getForm("site-settings", data);
        }

        if (viewName == "admin-users") {
          data.editFormUser = await formService.getForm(
            "user-register",
            undefined,
            "await submitContent(submission,true,'user');"
          );
          let users = await userService.getUsers();
          data.users = users;
        }

        if (viewName == "admin-roles") {
          data.editFormRole = await formService.getForm(
            "role",
            undefined,
            "submitContent(submission,true,'role')"
          );
          let roles = await userService.getRoles();
          data.roles = roles;
        }

        if (viewName == "admin-role-new") {
          data.editForm = await formService.getForm(
            "role",
            undefined,
            "submitContent(submission,true,'role');"
          );
        }

        if (viewName == "admin-role-edit") {
          let roleId = param1;
          let role = await dataService.getContentById(roleId);

          data.editForm = await formService.getForm(
            "role",
            role,
            'submitContent(submission, true, "role");'
          );
        }

        if (viewName == "admin-user-edit") {
          let user = { id: param1 };
          if (param1) {
            let userRecord = await userService.getUser(param1);
            // user.profile = userRecord.profile ? userRecord.profile : {};
            userRecord.data = userRecord.profile;
            userRecord.data.id = userRecord.id;

            data.editForm = await formService.getForm(
              "user",
              userRecord,
              'submitContent(submission, true, "user");'
            );
          }
        }

        let accessToken = "fakeToken"; //await userService.getToken(req);
        data.breadCrumbs = await breadcrumbsService.getAdminBreadcrumbs(req);

        // mixPanelService.trackEvent("PAGE_LOAD_ADMIN", req, {
        //   page: req.url,
        //   ip: ip,
        // });

        res.render(`admin/shared-views/${viewName}`, {
          layout: `admin/${adminTheme}/${adminTheme}`,
          data: data,
          accessToken: accessToken,
        });
      }
    );
  },

  checkIfAdminAccountIsCreated: async function () {
    // var user = loopback.getModel("user");
    //the must be at least one account
    // await user.find({limit: 1}, function (err, adminUser) {
    //   if (err) {
    //     console.log(err);
    //   }
    //   if (adminUser && adminUser.length > 0) {
    //     globalService.isAdminUserCreated = true;
    //   } else {
    //     globalService.isAdminUserCreated = false;
    //   }
    // });
  },
};
