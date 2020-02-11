var eventBusService = require("../services/event-bus.service");
var globalService = require("../services/global.service");
// globalService.startup();
var themes = require(__dirname + "../../themes/themes");
var pageBuilderService = require("../services/page-builder.service");
// var formio = require("../services/formio.service");
var adminService = require("../services/admin.service");
adminService.startup();
var dataService = require("../services/data.service");
dataService.startup();
var moduleService = require("../services/module.service");
moduleService.startup();
var formService = require("../services/form.service");
formService.startup();
var menuService = require("../services/menu.service");
var mediaService = require("../services/media.service");
var siteSettingsService = require("../services/site-settings.service");
var contentService = require("../services/content.service");
contentService.startup();
var cssService = require("../services/css.service");
cssService.startup();
var javascriptService = require("../services/javascript.service");
javascriptService.startup();
var userService = require("../services/user.service");
var helperService = require("../services/helper.service");
var sharedService = require("../services/shared.service");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
let ShortcodeFormatter = require("shortcode-tree").ShortcodeFormatter;

const path = require("path");
var cors = require("cors");
const chalk = require("chalk");
const log = console.log;
const url = require("url");
var admin = require(__dirname + "/admin");
var Amplitude = require("amplitude");
var amplitude = new Amplitude("00c9db8d087f1737021c841bcdbc2b41");

module.exports = function(app) {
  // app.get('/', async function (req, res) {
  //   res.send('ok');
  // });

  var router = app.loopback.Router();

  let page = "";
  let adminPage = "";

  (async () => {
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();
    await userService.startup();

    await eventBusService.emit("startup");
  })();

  app.get("*", async function(req, res, next) {
    globalService.AccessToken = app.models.AccessToken;
    next();
  });

  app.get("/register", async function(req, res) {
    let data = { registerMessage: "<b>admin</b>" };
    res.render("admin-register", { layout: "login.handlebars", data: data });
    return;
  });

  app.post("/register", function(req, res) {
    var user = app.models.User;
    user.create(
      { email: req.body.email, password: req.body.password },
      function(err, userInstance) {
        console.log(userInstance);
        globalService.isAdminUserCreated = true;
        let message = encodeURI(`Account created successfully. Please login`);
        res.redirect(`/admin?message=${message}`); // /admin will show the login
        return;
      }
    );
  });

  //log a user in
  app.post("/login", function(req, res) {
    var user = app.models.User;
    let referer = req.headers.referer;

    user.login(
      {
        email: req.body.email,
        password: req.body.password
      },
      "user",
      function(err, token) {
        if (err) {
          if (err.details && err.code === "LOGIN_FAILED_EMAIL_NOT_VERIFIED") {
            res.render("reponseToTriggerEmail", {
              title: "Login failed",
              content: err,
              redirectToEmail: "/api/users/" + err.details.userId + "/verify",
              redirectTo: "/",
              redirectToLinkText: "Click here",
              userId: err.details.userId
            });
          } else if (err.code) {
            let urlToRedirect = helperService.urlAppendParam(
              referer,
              "error",
              err.message
            );
            res.redirect(urlToRedirect);
          }
          return;
        }

        //amp
        var data = {
          event_type: "LOGIN", // required
          user_id: req.body.email // only required if device id is not passed in
        };
        amplitude.track(data);

        //set cookie
        res.cookie("sonicjs_access_token", token.id, {
          signed: true,
          maxAge: 30000000
        });
        res.redirect(referer);
      }
    );
  });

  //log a user out
  app.get("/logout", async function(req, res, next) {
    var user = app.models.User;
    var token = req.signedCookies.sonicjs_access_token;
    let currentUser = await userService.getCurrentUser(req);
    if (!token) return res.sendStatus(401);
    user.logout(token, async function(err) {
      if (err) {
        //user already logged out
        res.redirect("/admin");
      }

      //amp
      var data = {
        event_type: "LOGOUT", // required
        user_id: currentUser.email
      };
      amplitude.track(data);

      res.clearCookie("sonicjs_access_token");
      res.redirect("/admin");
    });
  });

  app.post("/admin/pb-update-module-sort", async function(req, res) {
    let data = req.body.data;
    console.log(data);

    let sourceSection = await dataService.getContentById(data.sourceSectionId);
    let content =
      sourceSection.data.rows[data.sourceRowIndex].columns[
        data.sourceColumnIndex
      ].content;
    // console.log("content", content);

    // remove shortcode from the source column
    let shortCodesInColumn = ShortcodeTree.parse(content);
    let shortCodeToRemove = shortCodesInColumn.children[data.sourceModuleIndex];
    // console.log("shortCodeToRemove", shortCodeToRemove);
    if (shortCodeToRemove && shortCodeToRemove.shortcode) {
      let newContent = content.replace(
        shortCodeToRemove.shortcode.codeText,
        ""
      );
      sourceSection.data.rows[data.sourceRowIndex].columns[
        data.sourceColumnIndex
      ].content = newContent;
      // console.log("newContent", newContent);
      await dataService.editContentInstance(sourceSection);
    }

    //regen the destination
    let destinationSection = await dataService.getContentById(
      data.destinationSectionId
    );

    let updatedDestinationContent = sharedService.generateShortCodeList(
      data.destinationModules
    );
    // console.log("updatedDestinationContent", updatedDestinationContent);
    destinationSection.data.rows[data.destinationRowIndex].columns[
      data.destinationColumnIndex
    ].content = updatedDestinationContent;
    let r = await dataService.editContentInstance(destinationSection);

    res.send(`ok`);
    // return;
  });

  app.post("/admin/pb-update-module-copy", async function(req, res) {
    let data = req.body.data;
    console.log(data);

    let section = await dataService.getContentById(data.sectionId);
    let content =
      section.data.rows[data.rowIndex].columns[data.columnIndex].content;
    console.log("content", content);

    //copy module
    let moduleToCopy = await dataService.getContentById(data.moduleId);
    let newModule = await dataService.createContentInstance(moduleToCopy);

    let sectionColumn =
      section.data.rows[data.rowIndex].columns[data.columnIndex];

    let shortCodesInColumn = ShortcodeTree.parse(sectionColumn.content);

    // generate short code ie: [MODULE-HELLO-WORLD id="123"]
    let args = { id: newModule.id };
    let moduleInstanceShortCodeText = sharedService.generateShortCode(
      `${newModule.data.contentType}`,
      args
    );

    let moduleInstanceShortCode = ShortcodeTree.parse(
      moduleInstanceShortCodeText
    ).children[0];

    shortCodesInColumn.children.splice(
      data.moduleIndex + 1,
      0,
      moduleInstanceShortCode
    );

    let newShortCodeContent = sharedService.generateContentFromShortcodeList(
      shortCodesInColumn
    );

    section.data.rows[data.rowIndex].columns[
      data.columnIndex
    ].content = newShortCodeContent;

    let result = await dataService.editContentInstance(section);

    res.send(`ok`);
    // // return;
  });

  app.post("/admin/pb-update-module-delete", async function(req, res) {
    let data = req.body.data;
    console.log(data);

    let section = await dataService.getContentById(data.sectionId);
    let content =
      section.data.rows[data.rowIndex].columns[data.columnIndex].content;
    // console.log("content", content);

    // remove shortcode from the source column
    let shortCodesInColumn = ShortcodeTree.parse(content);
    let shortCodeToRemove = shortCodesInColumn.children[data.moduleIndex];
    // console.log("shortCodeToRemove", shortCodeToRemove);
    if (shortCodeToRemove && shortCodeToRemove.shortcode) {
      let newContent = content.replace(
        shortCodeToRemove.shortcode.codeText,
        ""
      );
      section.data.rows[data.rowIndex].columns[
        data.columnIndex
      ].content = newContent;
      // console.log("newContent", newContent);
      await dataService.editContentInstance(section);
    }

    //regen the destination
    // let destinationSection = await dataService.getContentById(
    //   data.destinationSectionId
    // );

    // let updatedDestinationContent = sharedService.generateShortCodeList(
    //   data.destinationModules
    // );
    // console.log("updatedDestinationContent", updatedDestinationContent);
    // destinationSection.data.rows[data.destinationRowIndex].columns[
    //   data.destinationColumnIndex
    // ].content = updatedDestinationContent;
    // let r = await dataService.editContentInstance(destinationSection);

    res.send(`ok`);
  });

  app.get("/hbs", async function(req, res) {
    res.render("home");
  });

  app.get("/sandbox", async function(req, res) {
    let data = {};
    res.render("sandbox", { layout: "blank.handlebars", data: data });
  });

  app.get("/admin/sandbox", async function(req, res) {
    let data = {};
    res.render("sandbox", { layout: "admin.handlebars", data: data });
  });

  app.get("/test", async function(req, res) {
    res.send("ok");
  });

  app.get("/session-test", async function(req, res) {
    var token = req.signedCookies.sonicjs_access_token;
    if (req.session.views) {
      req.session.views++;
      res.setHeader("Content-Type", "text/html");
      res.write("<p>views: " + req.session.views + "</p>");
      res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
      res.end();
    } else {
      req.session.views = 1;
      res.end("welcome to the session demo. refresh!");
    }
  });

  app.get("/session-details", async function(req, res) {
    var token = req.signedCookies.sonicjs_access_token;
    let userId = await userService.getCurrentUserId(req);
    let user = await userService.getCurrentUser(req);

    console.log("getCurrentUser:" + user);

    res.send(`userId:${userId}`);
  });

  app.get("/css/generated.css", async function(req, res) {
    res.set("Content-Type", "text/css");
    let css = await cssService.getGeneratedCss();
    res.send(css);
  });

  app.post("/form-submission", async function(req, res) {
    console.log(req.body.data);

    await eventBusService.emit("afterFormSubmit", req.body.data);
  });

  // router.get('/admin/content-types', function (req, res) {
  //   res.send(adminPage);
  // });

  app.get("*", async function(req, res, next) {
    if (
      !globalService.isAdminUserCreated &&
      (req.url === "/" || req.url === "/admin")
    ) {
      if (process.env.MODE === "dev") {
        //brand new site, admin accounts needs to be created
        res.redirect("/register");
        return;
      }
    }

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
      req.url === "/explorer" ||
      req.url.startsWith("/api") ||
      req.url.endsWith(".css") ||
      req.url.endsWith(".html") ||
      req.url.endsWith(".ico") ||
      req.url.endsWith(".map") ||
      req.url.endsWith(".jpg") ||
      req.url.endsWith(".png") ||
      req.url.endsWith(".svg") ||
      req.url.endsWith(".js") ||
      req.url.indexOf("fonts") > -1 ||
      req.url.indexOf(".woff") > -1
    ) {
      // log(chalk.blue(req.url));

      return next();
    }

    if (process.env.MODE == "production") {
      console.log(`serving: ${req.url}`);
    }

    await eventBusService.emit("requestBegin", { req: req, res: res });

    // formio.getComponents();

    if (req.url.startsWith("/blog/")) {
      let page = await contentService.getBlog(req);
      res.render("blog", page);
    } else if (
      (req.url == "/admin" || req.url.startsWith("/admin/")) &&
      !(await userService.isAuthenticated(req))
    ) {
      if (process.env.MODE !== "dev") {
        res.send(401);
      }

      let qsParams = url.parse(req.url, true).query;
      let data = {};
      if (qsParams.error) {
        data.error = qsParams.error;
      }
      if (qsParams.message) {
        data.message = qsParams.message;
      }
      res.render("admin-login", { layout: "login.handlebars", data: data });
    } else if (req.url == "/admin" || req.url.startsWith("/admin/")) {
      if (!req.signedCookies.sonicjs_access_token) {
        //user not logged in
      }

      if (process.env.MODE !== "dev") {
        res.send(401);
      }

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
        data = await dataService.getContent();
        data.contentTypes = await dataService.getContentTypes();
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
      }

      if (viewName == "admin-content-types") {
        data = await dataService.getContentTypes();
      }

      if (viewName == "admin-content-types-edit") {
        data.contentTypeId = param1;
        data.raw = await dataService.getContentType(param1);
      }

      if (viewName == "admin-modules") {
        data = await moduleService.getModules();
      }

      if (viewName == "admin-modules-edit") {
        data.contentTypeId = param1;
        data.moduleDef = await moduleService.getModuleDefinitionFile(param1);
      }

      if (viewName == "admin-media") {
        data = await mediaService.getMedia();
      }

      if (viewName == "admin-menus") {
        data = await dataService.getContentByContentType("menu");
      }

      if (viewName == "admin-site-settings") {
        data = await dataService.getContentTopOne("site-settings");
        data.editForm = await formService.getForm("site-settings", data);
      }

      if (viewName == "admin-site-settings-colors") {
        data = await dataService.getContentTopOne("site-settings-colors");
        data.editForm = await formService.getForm("site-settings-colors", data);
      }

      if (viewName == "admin-site-settings-typography") {
        data = await dataService.getContentTopOne("site-settings");
        data.editForm = await formService.getForm("site-settings", data);
      }

      let accessToken = await userService.getToken(req);

      res.render(viewName, {
        layout: "admin.handlebars",
        data: data,
        accessToken: accessToken
      });
    } else {
      var page = await contentService.getRenderedPage(req);
      res.render("home", page);
    }
  });

  app.use(router);
};
