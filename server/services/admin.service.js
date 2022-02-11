var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
var listService = require(".//list.service");
var menuService = require(".//menu.service");
var helperService = require(".//helper.service");
var dataService = require(".//data.service");
var urlService = require(".//url.service");
var globalService = require(".//global.service");
const connectEnsureLogin = require("connect-ensure-login");
var dataService = require(".//data.service");
var userService = require(".//user.service");
var breadcrumbsService = require("../services/breadcrumbs.service");
var dalService = require(".//dal.service");
const mixPanelService = require("../modules/mixpanel/services/mixpanel-main-service");
const appAnalyticReportService = require("../modules/app-analytics/services/app-analytics-report-service");

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

module.exports = adminService = {
  startup: async function (app) {
    this.checkIfAdminAccountIsCreated();

    app.get(
      "/admin",
      connectEnsureLogin.ensureLoggedIn(),
      async function (req, res) {
        res.redirect('/admin/content');
      }
    );

    app.get(
      "/admin*",
      connectEnsureLogin.ensureLoggedIn(),
      async function (req, res) {
        if (process.env.MODE !== "dev") {
          if (adminDomain !== req.host) {
            res.send(401);
            return;
          }
        }

        globalService.setAreaMode(true, false, true);

        let path = req.url.split("/");
        let viewName = "admin-content";
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
          data = await dataService.getContentAdminCommon(req.sessionID);
          data.contentTypes = await dataService.contentTypesGet(req.sessionID);
        }

        if (viewName == "admin-content-all") {
          data = await dataService.getContentAdmin(req.sessionID);
          data.contentTypes = await dataService.contentTypesGet(req.sessionID);
        }

        if (viewName == "admin-content-edit") {
          let content = null;
          if (param2) {
            content = await dataService.getContentById(param2, req.sessionID);
          }
          data.editForm = await formService.getForm(
            param1,
            content,
            "submitContent(submission)",
            undefined,
            undefined,
            req.sessionID
          );
          data.contentId = param2;
        }

        if (viewName == "admin-content-types") {
          let dataRaw = await dataService.contentTypesGet(req.sessionID);
          data = _.sortBy(dataRaw, "title");
        }

        if (viewName == "admin-content-types-edit") {
          data.contentTypeId = param1;
          data.raw = await dataService.contentTypeGet(param1, req.sessionID);
        }

        if (viewName == "admin-modules") {
          data = await moduleService.getModules(req.sessionID);
        }

        if (viewName == "admin-modules-edit") {
          data.moduleSystemId = param1;
          data.contentTypes = await moduleService.getModuleContentTypesAdmin(
            param1,
            req.sessionID,
            req
          );
          data.contentTypeId = param1;
          data.moduleDef = await moduleService.getModuleDefinition(
            param1,
            req.sessionID
          );
        }

        if (viewName == "admin-media") {
          data = await mediaService.getMedia(req.sessionID);
        }

        if (viewName == "admin-menus-edit") {
          if (param1) {
            data = await dataService.getContentById(param1, req.sessionID);
            if (data.data.links) {
              data.data.linksString = JSON.stringify(data.data.links);
            }
          }
        }

        if (viewName == "admin-menus") {
          data = await dataService.getContentByContentType(
            "menu",
            req.sessionID
          );
        }

        if (viewName == "admin-taxonomy") {
          data = await dataService.getContentByContentType(
            "taxonomy",
            req.sessionID
          );
        }

        if (viewName == "admin-urls") {
          data.data = await urlService.getUrls();
        }

        if (viewName == "admin-backup-restore") {
          data.backupUrl = process.env.BACKUP_URL;
          data.restoreUrl = process.env.BACKUP_RESTORE_URL;
          data.files = fileService
            .getFilesSearchSync(
              fileService.getRootAppPath() + "/backups",
              "/**/*.zip"
            )
            .reverse();
          data.data = await urlService.getUrls();
        }

        if (viewName == "admin-site-settings") {
          data = await dataService.getContentTopOne(
            "site-settings",
            req.sessionID
          );
          data.editForm = await formService.getForm(
            "site-settings",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-theme-settings") {
          data = await dataService.getContentTopOne(
            "theme-settings",
            req.sessionID
          );
          data.editForm = await formService.getForm(
            "theme-settings",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-site-settings-colors") {
          data = await dataService.getContentTopOne(
            "site-settings-colors",
            req.sessionID
          );
          data.editForm = await formService.getForm(
            "site-settings-colors",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-site-settings-typography") {
          data = await dataService.getContentTopOne(
            "site-settings",
            req.sessionID
          );
          data.editForm = await formService.getForm(
            "site-settings",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-users") {
          data.editFormUser = await formService.getForm(
            "user-register",
            undefined,
            "await submitContent(submission,true,'user');",
            undefined,
            undefined,
            req.sessionID
          );
          let users = await userService.getUsers(req.sessionID);
          data.users = users;
        }

        if (viewName == "admin-roles") {
          data.editFormRole = await formService.getForm(
            "role",
            undefined,
            "submitContent(submission,true,'role')",
            undefined,
            undefined,
            req.sessionID
          );
          let roles = await userService.getRoles(req.sessionID);
          data.roles = roles;
        }

        if (viewName == "admin-role-new") {
          data.editForm = await formService.getForm(
            "role",
            undefined,
            "submitContent(submission,true,'role');",
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-role-edit") {
          let roleId = param1;
          let role = await dataService.getContentById(roleId, req.sessionID);

          data.editForm = await formService.getForm(
            "role",
            role,
            'submitContent(submission, true, "role");',
            undefined,
            undefined,
            req.sessionID
          );
        }

        if (viewName == "admin-user-edit") {
          let user = { id: param1 };
          if (param1) {
            let userRecord = await dalService.userGet(
              parseInt(param1),
              req.sessionID
            );
            userRecord.data = userRecord.profile ? userRecord.profile : {};
            // userRecord.data = userRecord.profile;
            userRecord.data.id = userRecord.id;

            data.editForm = await formService.getForm(
              "user",
              userRecord,
              'submitContent(submission, true, "user");',
              undefined,
              undefined,
              req.sessionID
            );
          }
        }

        if (viewName == "admin-reports-analytics") {
          data = await appAnalyticReportService.getAggregates(req.sessionID);
        }

        let accessToken = "fakeToken"; //await userService.getToken(req);
        data.breadCrumbs = await breadcrumbsService.getAdminBreadcrumbs(
          req,
          req.sessionID
        );

        //add session ID
        data.sessionID = req.sessionID;
        data.fileStorage = process.env.FILE_STORAGE;
        data.fileStorageBase = `https://${process.env.AMAZON_S3_BUCKETNAME}.s3.amazonaws.com`;

        res.render(`admin/shared-views/${viewName}`, {
          layout: `admin/${adminTheme}/${adminTheme}`,
          data: data,
          accessToken: accessToken,
        });

        await emitterService.emit("postAdminPageRender", (options = { req }));
      }
    );
  },

  checkIfAdminAccountIsCreated: async function (sessionID) {
    // the must be at least one account
    let users = await dalService.usersGetCount();

    if (users > 0) {
      globalService.isAdminUserCreated = true;
    } else {
      globalService.isAdminUserCreated = false;
    }
  },
};
