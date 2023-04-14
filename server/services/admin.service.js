/**
 * Admin Service -
 * The admin service is responsible for rendering the admin UI page.
 * @module adminService
 */
var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
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
var sharedService = require(".//shared.service");

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
var appRoot = require("app-root-path");

const adminTheme = `${process.env.ADMIN_THEME}`;
const adminDomain = process.env.ADMIN_DOMAIN;
const verboseLogging = process.env.APP_LOGGING === "verbose";

module.exports = adminService = {
  startup: async function (app) {
    this.checkIfAdminAccountIsCreated();

    app.get(
      "/admin",
      connectEnsureLogin.ensureLoggedIn(),
      async function (req, res) {
        res.redirect("/admin/content");
      }
    );

    app.get(
      "/admin*",
      connectEnsureLogin.ensureLoggedIn(),
      async function (req, res) {
        if (process.env.MODE !== "dev") {
          if (adminDomain !== req.hostname) {
            res.send(401);
            return;
          }
        }

        if ((await userService.canAccessBackEnd(req)) !== true) {
          res.send(401);
          return;
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

        await emitterService.emit("processUrl", {
          req,
          res,
          urlKey: "admin",
          page: data,
        });

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
          data.cardTitle = `New ${await helperService.titleCase(param1)}`
          if (param2) {
            content = await dataService.getContentById(param2, req.sessionID);
            data.cardTitle = content.data.title ? `Edit ${content.data.title}` : `Edit ${await helperService.titleCase(param1)}`;
          }
          data.editForm = await dataService.formGet(
            param1,
            content,
            "submitContent(submission)",
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
          data.contentId = param2;
          data.shortCode = content
            ? sharedService.generateShortCode(param1, {
                id: content.id,
              })
            : null;
        }

        if (viewName == "admin-content-types") {
          let dataRaw = await dataService.contentTypesGet(req.sessionID);
          data = _.sortBy(dataRaw, "title");
        }

        if (viewName == "admin-content-types-edit") {
          data.contentTypeId = param1;
          data.raw = await dataService.contentTypeGet(param1, req);
          data.showOnlyPermissionTab =
            data.raw.systemId === "site-settings-permissions";
          data.editForm = await dataService.formGet(
            param1,
            undefined,
            "submitContent(submission)",
            undefined,
            undefined,
            req.sessionID,
            req.url,
            true
          );

          data.showOnlyPermissionTab =
            data.raw.systemId === "site-settings-permissions";
          if (data.showOnlyPermissionTab) {
            //get site default acls
            const defaultACLs = await dataService.getContentTopOne(
              "site-settings-acls"
            );

            data.editFormACLs = await dataService.formGet(
              "site-settings-acls",
              defaultACLs,
              "submitContent(submission)",
              undefined,
              undefined,
              req.sessionID,
              req.url,
              false
            );
          }

          const states = data.raw.data.states
            ? {
                contentTypeId: "content-type-states",
                data: data.raw.data.states,
              }
            : undefined;

          // console.log("states", states);

          data.editFormStates = await dataService.formGet(
            "content-type-states",
            states,
            "onContentTypeStatesSave(submission)",
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
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
          data = await adminService.getSiteSettings(req);
        }

        if (viewName == "admin-theme-settings") {
          data = await dataService.getContentTopOne(
            "theme-settings",
            req.sessionID
          );
          data.editForm = await dataService.formGet(
            "theme-settings",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
        }

        if (viewName == "admin-site-settings-colors") {
          data = await dataService.getContentTopOne(
            "site-settings-colors",
            req.sessionID
          );
          data.editForm = await dataService.formGet(
            "site-settings-colors",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
        }

        if (viewName == "admin-site-settings-typography") {
          data = await dataService.getContentTopOne(
            "site-settings",
            req.sessionID
          );
          data.editForm = await dataService.formGet(
            "site-settings",
            data,
            undefined,
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
        }

        if (viewName == "admin-users") {
          data.editFormUser = await dataService.formGet(
            "user-register",
            undefined,
            "submitContent(submission,true,'user-register');",
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
          let users = await userService.getUsers(req.sessionID);
          data.users = users;
        }

        if (viewName == "admin-roles") {
          let data = await dataService.getContentByContentType(
            "roles",
            req.sessionID
          );
          res.redirect(`/admin/content/edit/roles/${data[0].id}`);
          return;
          // data.editFormRole = await dataService.formGet(
          //   "role",
          //   undefined,
          //   "submitContent(submission,true,'role')",
          //   undefined,
          //   undefined,
          //   req.sessionID,
          //   req.url
          // );
          // let roles = await userService.getRoles(req.sessionID);
          // data.roles = roles;
        }

        if (viewName == "admin-role-new") {
          data.editForm = await dataService.formGet(
            "role",
            undefined,
            "submitContent(submission,true,'role');",
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
        }

        if (viewName == "admin-role-edit") {
          let roleId = param1;
          let role = await dataService.getContentById(roleId, req.sessionID);

          data.editForm = await dataService.formGet(
            "role",
            role,
            'submitContent(submission, true, "role");',
            undefined,
            undefined,
            req.sessionID,
            req.url
          );
        }

        if (viewName == "admin-user-edit") {
          let user = { id: param1 };
          if (param1) {
            let userRecord = await dalService.userGet(param1, req.sessionID);
            userRecord.data = userRecord.profile ? userRecord.profile : {};
            // userRecord.data = userRecord.profile;
            userRecord.data.id = userRecord.id;

            data.editForm = await dataService.formGet(
              "user",
              userRecord,
              'submitContent(submission, true, "user");',
              undefined,
              undefined,
              req.sessionID,
              req.url
            );
          }
        }

        if (viewName == "admin-reports-analytics") {
          data = await appAnalyticReportService.getAggregates(req.sessionID);
        }

        if (viewName == "admin-reports-optins") {
          data = await appAnalyticReportService.getOptins(req.sessionID);
        }

        let accessToken = "fakeToken"; //await userService.getToken(req);
        data.breadCrumbs = await breadcrumbsService.getAdminBreadcrumbs(
          req,
          req.sessionID
        );

        //admin left menu
        data.nav = await dataService.getContentById(
          "c0f86b8d-01b7-491a-abe7-fa68b4ede8f6",
          req.sessionID
        );
        data.navCurrent = data.nav.data.items.find(
          (item) => item.path === req.url
        );
        if (data.navCurrent) {
          data.navCurrent.active = "active";
        }

        // site settings
        data.siteSettings = await dataService.getContentTopOne('site-settings', req.sessionID);

        //add session ID
        data.sessionID = req.sessionID;
        data.fileStorage = process.env.FILE_STORAGE;
        data.fileStorageBase = `https://${process.env.AMAZON_S3_BUCKETNAME}.s3.amazonaws.com`;

        let layoutPath = `${appRoot.path}/server/themes/admin/${adminTheme}/theme.hbs`;

        await res.app.emit("pagePreRender", { req, page: data });

        res.render(`server/themes/admin/shared-views/${viewName}`, {
          layout: layoutPath,
          data: data,
          accessToken: accessToken,
        });

        await emitterService.emit("postAdminPageRender", (options = { req }));
      }
    );
  },

  /**
   * Checks if the admin account has already been created
   * @example
   * // returns 2
   * globalNS.method1(5, 10);
   * @example
   * // returns 3
   * globalNS.method(5, 15);
   * @returns {Boolean} Returns true is admin account is already created
   */
  checkIfAdminAccountIsCreated: async function () {
    // the must be at least one account
    let users = await dalService.usersGetCount();

    if (users > 0) {
      globalService.isAdminUserCreated = true;
    } else {
      globalService.isAdminUserCreated = false;
    }

    if (verboseLogging) {
      console.log(
        "checkIfAdminAccountIsCreated",
        globalService.isAdminUserCreated
      );
    }
  },

  getSiteSettings: async function (req) {
    //get content types ending with "site-setting";
    let siteSettings = await dataService.contentTypesGet(req.sessionID);
    siteSettings = siteSettings.filter(
      (c) =>
        c.systemId.includes("-site-setting") || c.systemId === "site-settings"
    );

    siteSettings = _.sortBy(siteSettings, "title");

    await Promise.all(
      siteSettings.map(async (s) => {
        s.instance = await dataService.getContentTopOne(s.systemId);
        s.editForm = await dataService.formGet(
          s.systemId,
          s.instance,
          "submitContent(submission)",
          undefined,
          undefined,
          req.sessionID
        );
      })
    );

    return siteSettings;
  },
};
