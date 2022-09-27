// var loopback = require("loopback");
var emitterService = require("../services/emitter.service");
var globalService = require("../services/global.service");
var cacheService = require("../services/cache.service");
var urlService = require("../services/url.service");
urlService.startup();
var pageBuilderService = require("../services/page-builder.service");
var adminService = require("../services/admin.service");
var dataService = require("../services/data.service");
dataService.startup();
var moduleService = require("../services/module.service");
var formService = require("../services/form.service");
var menuService = require("../services/menu.service");
var mediaService = require("../services/media.service");
var siteSettingsService = require("../services/site-settings.service");
var themeSettingsService = require("../services/theme-settings.service");
var contentService = require("../services/content.service");
var cssService = require("../services/css.service");
var assetService = require("../services/asset.service");
var userService = require("../services/user.service");
var authService = require("../services/auth.service");
var dalService = require("../services/dal.service");
var backupService = require("../services/backup.service");
var backupRestoreService = require("../services/backup-restore.service");
var testService = require("../services/test.service");

var helperService = require("../services/helper.service");
var sharedService = require("../services/shared.service");
var breadcrumbsService = require("../services/breadcrumbs.service");
var mixPanelService = require("../modules/mixpanel/services/mixpanel-main-service");
var _ = require("underscore");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
let ShortcodeFormatter = require("shortcode-tree").ShortcodeFormatter;

const path = require("path");
var cors = require("cors");
const chalk = require("chalk");
const log = console.log;
const url = require("url");
var appRoot = require("app-root-path");
const fileService = require("../services/file.service");
var pageLoadedCount = 0;

var frontEndTheme = `${process.env.FRONT_END_THEME}`;

exports.loadRoutes = async function (app) {
  authService.startup(app);
  adminService.startup(app);
  formService.startup(app);
  backupService.startup(app);
  backupRestoreService.startup(app);

  let page = "";
  let adminPage = "";

  (async () => {
    await dalService.startup(app);
    await cacheService.startup();
    await contentService.startup(app);
    await moduleService.startup(app);
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();
    await themeSettingsService.startup();
    await userService.startup(app);
    await assetService.startup();
    await pageBuilderService.startup(app);
    await pageBuilderService.startup(app);
    await testService.startup(app);
    await cssService.startup(app);

    await emitterService.emit("startup", { app: app });

    //load catch-all last
    this.loadRoutesCatchAll(app);

    await emitterService.emit("started", { app: app });
  })();

  app.get("*", async function (req, res, next) {
    globalService.AccessToken = "todo-access-token";

    if (req.session) {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    }

    next();
  });

  app.get("/hbs", async function (req, res) {
    res.render("home");
  });

  app.get("/nested-forms-list*", async function (req, res) {
    let contentTypesRaw = await dataService.contentTypesGet();
    let contentTypes = contentTypesRaw.map(function (contentType) {
      return {
        _id: contentType.systemId,
        type: "form",
        title: contentType.title,
      };
    });
    let sorted = _.sortBy(contentTypes, "title");

    res.send(sorted);
  });

  app.get("/form/*", async function (req, res) {
    let moduleSystemId = req.path.replace("/form/", "");
    let contentType = await dataService.contentTypeGet(moduleSystemId, req);
    let form = await formService.getFormJson(contentType, req);
    res.send(form);
  });

  app.get("/health", async function (req, res) {
    res.status(200).send("ok");
  });

  app.get("/health-database", async function (req, res) {
    let content = await dataService.getContentByUrl("/");
    if (content && content.contentTypeId === "page") {
      res.status(200).send("ok");
    } else {
      res.status(500).send("database offline");
    }
  });

  app.get("/theme1", async function (req, res) {
    let data = {};
    res.render("sandbox", { layout: theme, data: data });
  });

  app.get("/theme2", async function (req, res) {
    let data = {};
    res.render("sandbox", { layout: "theme2.handlebars", data: data });
  });

  app.get("/admin/sandbox", async function (req, res) {
    let data = {};
    res.render("sandbox", { layout: "admin.handlebars", data: data });
  });

  app.get("/css/generated.css", async function (req, res) {
    res.set("Content-Type", "text/css");
    let css = await cssService.getGeneratedCss();
    res.send(css);
  });

  app.post("/dropzone-upload", async function (req, res) {
    console.log("dropzone-upload req.files.file", req.files.file);
    await fileService.uploadWriteFile(req.files.file, req.sessionID);
    res.sendStatus(200);
  });

  app.post("/form-submission", async function (req, res) {
    let payload = req.body.data ? req.body.data : req.body.data.data;
    let contentTypeId = payload.contentType;
    if (payload) {
      let options = { data: payload, sessionID: req.sessionID };

      await emitterService.emit("afterFormSubmit", options);

      // if (!payload.contentType.startsWith("user")) {
      //   if (submission.id || submission.data.id) {
      //     await editInstance(entity, refresh, contentType);
      //   } else {
      //     await createInstance(entity, true, contentType);
      //   }
      // }
      let entity;

      let contentType = await dataService.contentTypeGet(contentTypeId, req);

      if (payload.id) {
        //edit existing
        if (contentTypeId === "user") {
          //do nothing, already managed by hook
          // entity = await dataService.userUpdate(payload, req.sessionID);
        } else {
          entity = await dataService.editInstance(payload, req.sessionID);
        }
      } else {
        //create new
        let newContent = { contentType: payload.contentType, data: payload };
        entity = await dataService.contentCreate(
          newContent,
          true,
          req.sessionID
        );
      }

      let redirectTo = "/";
      // if (entity && entity.contentTypeId === "page") {
      //   let isBackEnd = globalService.isBackEnd();
      //   if (isBackEnd) {
      //     redirectTo = `/admin/content/edit/page/${entity.id}`;
      //   } else {
      //     // window.location.href = payload.data.url;
      //     redirectTo = payload.data.url;
      //   }
      // }
      // else if (refresh) {
      //   fullPageUpdate();
      // }
      let successAction;

      if (contentType.data?.states) {
        if (contentType.data.states.postSubmission === "redirectToUrl") {
          successAction = `redirectToUrl('${contentType.data.postSubmission.redirectUrl}');`;
        } else if (contentType.data.states.postSubmission === "showMessage") {
          successAction = `postSubmissionSuccessMessage("${contentType.data.postSubmission.message}");`;
        } else if (contentType.data.states.postSubmission === "doNothing") {
          successAction = `javascript:void(0);`;
        } else if (contentType.data.states.postSubmission === "callFunction") {
          successAction = contentType.data.states.functionToCall;
        }
      }

      //if admin, redirect to edit page
      let isBackEnd = req.body.url.startsWith("/admin");
      if (isBackEnd && !successAction) {
        successAction = `redirectToUrl('/admin/content/edit/${contentTypeId}/${entity.id}');`;
      } else if (!isBackEnd && contentTypeId === "page") {
        successAction = `redirectToUrl('${entity.url}');`;
      }

      successAction = successAction ?? "fullPageUpdate();";

      res.send({ successAction });
    }
  });

  app.post("*", async function (req, res, next) {
    await emitterService.emit("postBegin", { req: req, res: res });

    if (!req.isRequestAlreadyHandled) {
      next();
    }
  });
};

exports.loadRoutesCatchAll = async function (app) {
  // app.get(/^[^.]*$/, async function (req, res, next) {
  app.get("*", async function (req, res, next) {
    await emitterService.emit("requestBegin", { req: req, res: res });

    if (req.isRequestAlreadyHandled) {
      //modules can set the req.isRequestAlreadyHandled to true if they
      //have already fully handled the request including the response.
      return;
    }

    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    //for modules css/js files
    if (
      (req.url.endsWith(".css") || req.url.endsWith(".js")) &&
      req.url.startsWith("/modules/")
    ) {
      let cssFile = path.join(__dirname, "..", req.url);
      // res.set('Content-Type', 'text/css');
      res.sendFile(cssFile);
      return;
    }

    if (
      req.url.startsWith("/graphql") ||
      req.url.startsWith("/login") ||
      req.url.startsWith("/register") ||
      req.url.startsWith("/api") ||
      req.url.endsWith(".css") ||
      req.url.endsWith(".html") ||
      req.url.endsWith(".ico") ||
      req.url.endsWith(".map") ||
      req.url.endsWith(".jpg") ||
      req.url.endsWith(".png") ||
      req.url.endsWith(".svg") ||
      req.url.endsWith(".txt") ||
      req.url.endsWith(".js") ||
      req.url.indexOf(".js?") > -1 ||
      req.url.indexOf("fonts") > -1 ||
      req.url.indexOf(".woff") > -1
    ) {
      return next();
    }

    //allow something other than '/' to be the site home page
    if (
      req.url === "/" &&
      req.siteSettings.homePageUrl &&
      req.siteSettings.homePageUrl !== "/"
    ) {
      res.redirect(301, req.siteSettings.homePageUrl);
      return;
    }

    if (req.user?.profile) {
      req.user.profile.currentPageUrl = req.url;
    }

    if (process.env.MODE == "production") {
      console.log(`serving: ${req.url}`);
    }

    let isAuthenticated = await userService.isAuthenticated(req);
    globalService.setAreaMode(false, true, isAuthenticated);

    //lookup which module should handle this request
    // console.log("processing", req.url);
    let urlKey = await urlService.getUrl(req.url);
    // console.log("urlKey", urlKey);

    //replace this will

    var page = {};
    req.urlKey = urlKey;
    var processUrlOptions = { req, res, urlKey, page };

    await emitterService.emit("processUrl", processUrlOptions);
    page = processUrlOptions.page;

    // return;

    if (!page.data || page.data?.title === "Not Found") {
      res.redirect("/404");
      return;
    }

    await emitterService.emit("preRenderTemplate", (options = { page, req }));

    page.data.id = page.id;
    page.data.sessionID = req.sessionID;
    page.data.themeSettings.bootstrapToggleMiddle =
      page.data.themeSettings.bootstrapVersion == 4 ? "" : "bs-";

    //add user data
    page.data.user = req.user ? req.user : { username: "anon" };
    page.data.user.isAuthenticated = req.user ? true : false;
    page.data.siteSettings = req.siteSettings;

    //check is edit mode, sidebar expanded
    page.data.isEditMode = req.cookies.showSidebar === "false" ? false : true;
    page.data.sidebarClass = page.data.isEditMode ? "expanded" : "collapsed";

    res.render(`${frontEndTheme}/layouts/main`, {
      layout: path.join(appRoot.path, frontEndTheme, "theme.hbs"),
      data: page.data,
    });

    req.pageLoadedCount = pageLoadedCount;
    if (pageLoadedCount < 1) {
      await emitterService.emit("firstPageLoaded", (options = { req }));
    }
    pageLoadedCount++;

    await emitterService.emit("postPageRender", (options = { page, req }));
  });
};
