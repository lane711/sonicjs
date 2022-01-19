var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");
var globalService = require("./global.service");
var userService = require("./user.service");
var appRoot = require("app-root-path");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
var { GraphQLClient, gql, request } = require("graphql-request");
const connectEnsureLogin = require("connect-ensure-login");
const url = require("url");
const querystring = require("querystring");
const dalService = require("./dal.service");
const passport = require("passport");
const fileService = require("./file.service");
var frontEndTheme = `${process.env.FRONT_END_THEME}`;
const adminTheme = `${process.env.ADMIN_THEME}`;
const adminDomain = process.env.ADMIN_DOMAIN;

module.exports = authService = {
  startup: async function (app) {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        // options.page.data.showPageBuilder = await userService.isAuthenticated(
        //   options.req
        // );
      }
    });

    app.get(/^[^.]*$/, async function (req, res, next) {
      if (!req.url.indexOf("/register-admin") == 0) {
        if (!globalService.isAdminUserCreated) {
          res.redirect("/register-admin");
          return;
        }
      }
      next();
    });

    app.get("/session-details", async function (req, res) {
      res.send({ user: req.user });
    });

    app.get("/register", async function (req, res) {
      let data = { registerMessage: "<b>user</b>" };
      res.render("admin/shared-views/user-register", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      return;
    });

    app.post("/register", async function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;

      let newUser = await userService.registerUser(email, password);

      let message = encodeURI(`Account created successfully. Please login`);
      res.redirect(`/login?message=${message}`); // /admin will show the login
      return;
    });

    app.get("/register-admin", async function (req, res) {
      if (globalService.isAdminUserCreated == true) {
        res.send("Admin account already created");
      }

      let data = {};
      let parsedUrl = url.parse(req.url);
      let parsedQs = querystring.parse(parsedUrl.query);
      if (parsedQs && parsedQs.message) {
        data.message = parsedQs.message;
      }

      res.render("admin/shared-views/admin-register", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      return;
    });

    app.post("/register-admin", async function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      let websiteTitle = req.body.title;

      let isEmailValid = helperService.validateEmail(email);
      if (!isEmailValid || password !== passwordConfirm) {
        res.redirect(
          `/register-admin?message=Please enter a valid email and matching passwords`
        );
        return;
      }

      req.session.optinEmail = email;
      req.app.set("optinEmail", email);
      req.session.websiteTitle = websiteTitle;

      let newUser = await userService.registerUser(email, password, true);

      globalService.isAdminUserCreated = true;

      helperService.sleep(500);

      res.redirect(`/register-admin-optin`); // /admin will show the login
      return;
    });

    app.get("/register-admin-optin", async function (req, res) {
      let data = { email: req.app.get("optinEmail") };
      res.render("admin/shared-views/admin-register-optin", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      return;
    });

    app.post("/register-admin-optin", async function (req, res) {
      let agreeToFeedback = req.body.agreeToFeedback === "on" ? true : false;

      try {
        const installFile = require(appRoot.path +
          "/server/data/config/installId.json");

        installFile.websiteTitle = req.session.websiteTitle;
        installFile.agreeToFeedback = agreeToFeedback;
        installFile.email = req.body.email;

        await fileService.writeFile(
          "/server/data/config/installId.json",
          JSON.stringify(installFile)
        );
      } catch (error) {
        console.log("unable to post analytics");
      }

      globalService.isAdminUserCreated = true;
      let message = encodeURI(`Account created successfully. Please login`);

      res.redirect(`/login?message=${message}`); // /admin will show the login
      return;
    });

    app.post("/login", (req, res, next) => {
      if (process.env.MODE !== "dev") {
        if (adminDomain !== req.host) {
          res.send(401);
          return;
        }
      }

      console.log("passport.authenticate");

      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.redirect(
            "/login?error=Invalid Email/Password Combination"
          );
        }

        req.logIn(user, async function (err) {
          if (err) {
            console.error(err);
            return next(err);
          }

          if (!req.session.returnTo) {
            console.log("redirect to admin");
            return res.redirect("/admin");
          } else {
            console.log("redirect to " + req.session.returnTo);
            return res.redirect(req.session.returnTo);
          }
        });
      })(req, res, next);
    });

    app.get("/private", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
      res.sendFile("html/private.html", { root: __dirname })
    );

    app.get("/user", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
      res.send({ user: req.user })
    );

    app.get("/login", async function (req, res) {
      if (process.env.MODE !== "dev") {
        if (adminDomain !== req.host) {
          res.send(401);
          return;
        }
      }

      //check if use is already logged in
      if (req.user && req.user.profile.roles.includes("admin")) {
        return res.redirect("/admin");
      }

      let data = { registerMessage: "<b>admin</b>" };

      let parsedUrl = url.parse(req.url);
      let parsedQs = querystring.parse(parsedUrl.query);
      if (parsedQs && parsedQs.message) {
        data.message = parsedQs.message;
      }
      if (parsedQs && parsedQs.error) {
        data.error = parsedQs.error;
      }

      res.render("admin/shared-views/admin-login", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      // return;
    });

    app.get("/logout", function (req, res) {
      console.log("logging out:" + req.user.username);
      req.session.destroy(function (err) {
        res.redirect("/"); //Inside a callback… bulletproof!
      });
    });

    emitterService.on("requestBegin", async function (options) {
      if (options.req.url === "/register") {
        options.req.isRequestAlreadyHandled = true;
        let data = { registerMessage: "<b>admin</b>" };
        options.res.render("admin/shared-views/admin-register", {
          layout: `front-end/${frontEndTheme}/login.handlebars`,
          data: data,
        });
      }
    });
  },

  createUser: async function (email, password) {
    const query = gql`
    mutation{
      userCreate(email:"${email}", password:"${password}"){
        email
        id
      }
    }
      `;

    let data = await dataService.executeGraphqlQuery(query);

    return data.contents;
  },
};
