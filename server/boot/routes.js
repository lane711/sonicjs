// var loopback = require("loopback");
var emitterService = require("../services/emitter.service");
var globalService = require("../services/global.service");
var cacheService = require("../services/cache.service");

// globalService.startup();
// var themes = require(__dirname + "../../themes/themes");
var pageBuilderService = require("../services/page-builder.service");
// var formio = require("../services/formio.service");
var adminService = require("../services/admin.service");

var dataService = require("../services/data.service");
dataService.startup();
var moduleService = require("../services/module.service");
// moduleService.startup();
var formService = require("../services/form.service");
var menuService = require("../services/menu.service");
var mediaService = require("../services/media.service");
var siteSettingsService = require("../services/site-settings.service");
var themeSettingsService = require("../services/theme-settings.service");
var contentService = require("../services/content.service");
contentService.startup();
var cssService = require("../services/css.service");
cssService.startup();
var assetService = require("../services/asset.service");
var userService = require("../services/user.service");
var authService = require("../services/auth.service");
var dalService = require("../services/dal.service");
var backupService = require("../services/backup.service");
var backupRestoreService = require("../services/backup-restore.service");

var helperService = require("../services/helper.service");
var sharedService = require("../services/shared.service");
var breadcrumbsService = require("../services/breadcrumbs.service");
var mixPanelService = require("../modules/mixpanel/services/mixpanel-main-service");
var _ = require("underscore");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
let ShortcodeFormatter = require("shortcode-tree").ShortcodeFormatter;
var appRoot = require("app-root-path");

const path = require("path");
var cors = require("cors");
const chalk = require("chalk");
const log = console.log;
const url = require("url");
var pageLoadedCount = 0;
// var admin = require(__dirname + "/admin");

var frontEndTheme = `${process.env.FRONT_END_THEME}`;

exports.loadRoutes = async function (app) {
  authService.startup(app);
  adminService.startup(app);
  formService.startup(app);
  backupService.startup(app);
  backupRestoreService.startup(app);

  // app.get('/', async function (req, res) {
  //   res.send('ok');
  // });

  // var router = app.loopback.Router();

  let page = "";
  let adminPage = "";

  (async () => {
    await dalService.startup(app);
    await cacheService.startup();
    await moduleService.startup(app);
    await menuService.startup();
    await mediaService.startup();
    await siteSettingsService.startup();
    await themeSettingsService.startup();
    await userService.startup(app);
    await assetService.startup();
    await pageBuilderService.startup(app);
    await pageBuilderService.startup(app);

    await emitterService.emit("startup", { app: app });

    //load catch-all last
    this.loadRoutesCatchAll(app);

    await emitterService.emit("started", { app: app });
  })();

  app.get("*", async function (req, res, next) {
    //TODO: https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
    globalService.AccessToken = "todo-access-token";

    // Update a value in the cookie so that the set-cookie will be sent.
    // Only changes every minute so that it's not sent with every request.
    if (req.session) {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    }

    next();
  });

  // await emitterService.emit("loadRoutes", { app: app });

  // app.get("/register", async function (req, res) {
  //   let data = { registerMessage: "<b>admin</b>" };
  //   res.render("admin/shared-views/admin-register", { layout: `front-end/${frontEndTheme}/login.handlebars`, data: data });
  //   return;
  // });

  // app.post("/register", function (req, res) {
  //   // var user = loopback.getModel("user");
  //   user.create(
  //     { email: req.body.email, password: req.body.password, roles: [1] },
  //     function (err, userInstance) {
  //       // console.log(userInstance);

  //       //map admin role
  //       // var roleMappingModel = loopback.getModel("RoleMapping");
  //       // roleMappingModel.upsertWithWhere(
  //       //   {
  //       //     principalType: "user",
  //       //     principalId: 1,
  //       //     roleId: "admin",
  //       //   },
  //       //   {
  //       //     principalType: "user",
  //       //     principalId: 1,
  //       //     roleId: "admin",
  //       //   },
  //       //   function (err, info) {
  //       //     if (err) {
  //       //       console.log(info);
  //       //     }
  //       //   }
  //       // );

  //       globalService.isAdminUserCreated = true;
  //       let message = encodeURI(`Account created successfully. Please login`);
  //       res.redirect(`/admin?message=${message}`); // /admin will show the login
  //       return;
  //     }
  //   );
  // });

  //log a user in
  // app.post("/login", function (req, res) {
  //   var user = app.models.User;
  //   let referer = req.headers.referer;

  //   user.login(
  //     {
  //       email: req.body.email,
  //       password: req.body.password,
  //     },
  //     "user",
  //     function (err, token) {
  //       if (err) {
  //         if (err.details && err.code === "LOGIN_FAILED_EMAIL_NOT_VERIFIED") {
  //           res.render("reponseToTriggerEmail", {
  //             title: "Login failed",
  //             content: err,
  //             redirectToEmail: "/api/user/" + err.details.userId + "/verify",
  //             redirectTo: "/",
  //             redirectToLinkText: "Click here",
  //             userId: err.details.userId,
  //           });
  //         } else if (err.code) {
  //           let urlToRedirect = helperService.urlAppendParam(
  //             referer,
  //             "error",
  //             err.message
  //           );
  //           res.redirect(urlToRedirect);
  //         }
  //         return;
  //       }

  //       //amp
  //       var data = {
  //         event_type: "LOGIN", // required
  //         user_id: req.body.email, // only required if device id is not passed in
  //       };

  //       //set cookie
  //       res.cookie("sonicjs_access_token", token.id, {
  //         signed: true,
  //         maxAge: 30000000,
  //       });

  //       mixPanelService.setPeople(req.body.email);

  //       mixPanelService.trackEvent("LOGIN", req, { email: req.body.email });
  //       if (referer.includes("/admin?")) {
  //         referer = "/admin";
  //       }
  //       res.redirect(referer);
  //     }
  //   );
  // });

  //log a user out
  app.get("/logout", async function (req, res, next) {
    var user = app.models.User;
    var token = req.signedCookies.sonicjs_access_token;
    let currentUser = await userService.getCurrentUser(req);
    if (!token) return res.sendStatus(401);

    user.logout(token, async function (err) {
      if (err) {
        //user already logged out
        res.redirect("/admin");
      }

      //amp
      var data = {
        event_type: "LOGOUT", // required
        user_id: currentUser.email,
      };

      res.clearCookie("sonicjs_access_token");
      res.redirect("/admin");
    });
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
    let contentType = await dataService.contentTypeGet(
      moduleSystemId,
      req.sessionID
    );
    let form = await formService.getFormJson(contentType, req.sessionID);
    res.send(form);
  });

  app.get("/zsandbox", async function (req, res) {
    let data = {};
    res.render("sandbox", { layout: "blank.handlebars", data: data });
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

  app.get("/ztest", async function (req, res) {
    res.send("ok");
  });

  app.get("/grapejs", async function (req, res) {
    res.sendFile('./server/page-builder/grappejs/grapejs.html', { root: appRoot.path });
  });

  app.get("/session-test", async function (req, res) {
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

  app.get("/session-details", async function (req, res) {
    var token = req.signedCookies.sonicjs_access_token;
    let userId = await userService.getCurrentUserId(req);
    let user = await userService.getCurrentUser(req);

    // console.log("getCurrentUser:" + user);

    res.send(`userId:${userId}`);
  });

  app.get("/css/generated.css", async function (req, res) {
    res.set("Content-Type", "text/css");
    let css = await cssService.getGeneratedCss();
    res.send(css);
  });

  app.post("/form-submission", async function (req, res) {
    let payload = req.body.data ?? req.body;

    //hack for newletter
    // if(!payload.data && payload.contentType){
    //   payload.data = {contentType : payload.contentType};
    // }
    let options = { data: payload, sessionID: req.sessionID };

    await emitterService.emit("afterFormSubmit", options);

    res.sendStatus(200);
  });

  // router.get('/admin/content-types', function (req, res) {
  //   res.send(adminPage);
  // });

  app.post("*", async function (req, res, next) {
    await emitterService.emit("postBegin", { req: req, res: res });

    if (!req.isRequestAlreadyHandled) {
      next();
    }
  });
};

exports.loadRoutesCatchAll = async function (app) {
  app.get("*", async function (req, res, next) {
    await emitterService.emit("requestBegin", { req: req, res: res });

    if (req.isRequestAlreadyHandled) {
      //modules can set the req.isRequestAlreadyHandled to true if they
      //have already fully handled the request including the response.
      return;
    }

    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (req.url.startsWith("/images/")) {
      // console.log("continuing request");
    }

    // if (
    //   !globalService.isAdminUserCreated &&
    //   (req.url === "/" || req.url === "/admin")
    // ) {
    //   if (process.env.MODE === "dev") {
    //     //brand new site, admin accounts needs to be created
    //     res.redirect("/register");
    //     return;
    //   }
    // }

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
      // log(chalk.blue(req.url));

      return next();
    }

    if (process.env.MODE == "production") {
      console.log(`serving: ${req.url}`);
    }

    //ensure session exists if app just starting up
    // pageLoadedCount++;
    // req.pageLoadedCount = pageLoadedCount;
    // if (pageLoadedCount < 10) {
    //   let session = await dalService.sessionGet(req.sessionID);
    //   if (!session) {
    //     res.redirect("/");
    //     return;
    //   }
    // }



    let isAuthenticated = await userService.isAuthenticated(req);
    globalService.setAreaMode(false, true, isAuthenticated);
    var { page } = await contentService.getRenderedPage(req);

    if (page.data.title === "Not Found") {
      // res.render("404", page);
      res.render(`front-end/${frontEndTheme}/layouts/404`, {
        layout: `front-end/${frontEndTheme}/${frontEndTheme}`,
      });

      return;
    }

    await emitterService.emit("preRenderTemplate", (options = { page, req }));

    page.data.id = page.id;
    page.data.sessionID = req.sessionID;

    res.render(`front-end/${frontEndTheme}/layouts/main`, {
      layout: `front-end/${frontEndTheme}/${frontEndTheme}`,
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
