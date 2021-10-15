var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");
var globalService = require("./global.service");
var userService = require("./user.service");
// var loopback = require("loopback");
// var app = loopback();
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

      let newUser = await userService.registerUser(email, password, agreeToFeedback);

      let message = encodeURI(`Account created successfully. Please login`);
      res.redirect(`/login?message=${message}`); // /admin will show the login
      return;
    });


    app.get("/register-admin", async function (req, res) {

      let data = { };
      let parsedUrl = url.parse(req.url);
      let parsedQs = querystring.parse(parsedUrl.query);
      if (parsedQs && parsedQs.message) {
        data.message = parsedQs.message;
      }
      
      if(globalService.isAdminUserCreated == true){
        res.send('Admin account already created');
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

      let isEmailValid = helperService.validateEmail(email);
      if(!isEmailValid || password !== passwordConfirm){
        res.redirect(`/register-admin?message=Invalid email or password do no match`); // /admin will show the login
      }

      let newUser = await userService.registerUser(email, password, false, true);

      globalService.isAdminUserCreated = true;
      let message = encodeURI(`Account created successfully. Please login`);
      req.session.optinEmail = email;
      res.redirect(`/register-admin-optin`); // /admin will show the login
      return;
    });

    app.get("/register-admin-optin", async function (req, res) {

      if(globalService.isAdminUserCreated == true){
        res.send('Admin account already created');
      }

      let data = { email: req.session.optinEmail };
      res.render("admin/shared-views/admin-register-optin", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      return;
    });


    app.post("/register-admin-optin", async function (req, res) {

      let agreeToFeedback = req.body.agreeToFeedback === 'on' ? true : false;

      let newUser = await userService.registerUser(email, password, agreeToFeedback, true);

      globalService.isAdminUserCreated = true;
      let message = encodeURI(`Account created successfully. Please login`);
      req.session.optinEmail = email;
      res.redirect(`/admin`); // /admin will show the login
      return;
    });

    //TODO: https://www.sitepoint.com/local-authentication-using-passport-node-js/
    // app.post(
    //   "/login",
    //   passport.authenticate("local", {
    //     successReturnToOrRedirect: "/",
    //     failureRedirect: "/login",
    //   }) () =>{

    //   }
    // );

    app.post('/login', (req, res, next) => {

      if (process.env.MODE !== "dev") {
        if (adminDomain !== req.host) {
          res.send(401);
          return;
        }
      }

      passport.authenticate('local',
      (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.redirect('/login?info=' + info);
        }

        req.logIn(user, async function(err) {
          if (err) {
            return next(err);
          }

          if(!req.session.returnTo){
            return res.redirect('/admin');
          }else{
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

      let data = { registerMessage: "<b>admin</b>" };

      let parsedUrl = url.parse(req.url);
      let parsedQs = querystring.parse(parsedUrl.query);
      if (parsedQs && parsedQs.message) {
        data.message = parsedQs.message;
      }

      res.render("admin/shared-views/admin-login", {
        layout: `front-end/${frontEndTheme}/login.hbs`,
        data: data,
      });
      // return;
    });

    app.get("/logout", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
      req.logout();
      res.redirect("/");
    });

    // app.post("/login", passport.authenticate("local"), function (req, res) {
    //   // If this function gets called, authentication was successful.
    //   // `req.user` contains the authenticated user.
    //   res.redirect("/users/" + req.user.username);
    // });

    // app.post("/login", function (req, res) {
    //   console.log('login post');
    // });

    // log a user in
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

    emitterService.on("requestBegin", async function (options) {
      if (options.req.url === "/register") {
        options.req.isRequestAlreadyHandled = true;
        let data = { registerMessage: "<b>admin</b>" };
        options.res.render("admin/shared-views/admin-register", {
          layout: `front-end/${frontEndTheme}/login.handlebars`,
          data: data,
        });

        // options.res.sendFile(file);
        // options.req.isRequestAlreadyHandled = true;
        // return;
      }
    });

    // emitterService.on("postBegin", async function (options) {
    //   if (options.req.url === "/register") {
    //     // var user = loopback.getModel("user");
    //     let email = options.req.body.email;
    //     let password = options.req.body.password;
    //     let passwordConfirm = options.req.body.passwordConfirm;

    //     let newUser = await userService.createUser(email, password);

    //     globalService.isAdminUserCreated = true;
    //     let message = encodeURI(`Account created successfully. Please login`);
    //     res.redirect(`/admin?message=${message}`); // /admin will show the login
    //     return;
    //   }
    // });

    // emitterService.on("requestBegin", async function (options) {
    //   if (options.req.url === "/login") {
    //     options.req.isRequestAlreadyHandled = true;

    //     // res.render("admin/shared-views/admin-login", { layout: `front-end/${frontEndTheme}/login.handlebars`, data: data });

    //     let data = { registerMessage: "<b>admin</b>" };
    //     options.res.render("admin/shared-views/admin-login", {
    //       layout: `front-end/${frontEndTheme}/login.handlebars`,
    //       data: data,
    //     });

    //     // options.res.sendFile(file);
    //     // options.req.isRequestAlreadyHandled = true;
    //     // return;
    //   }
    // });

    // emitterService.on("postBegin", async function (options) {
    //   if (options.req.url === "/login") {
    //     let email = options.req.body.email;
    //     let password = options.req.body.password;
    //     console.log(email, password);

    //     // var user = app.models.User;
    //     let referer = req.headers.referer;

    //     //   user.login(
    //     //     {
    //     //       email: req.body.email,
    //     //       password: req.body.password,
    //     //     },
    //     //     "user",
    //     //     function (err, token) {
    //     //       if (err) {
    //     //         if (err.details && err.code === "LOGIN_FAILED_EMAIL_NOT_VERIFIED") {
    //     //           res.render("reponseToTriggerEmail", {
    //     //             title: "Login failed",
    //     //             content: err,
    //     //             redirectToEmail: "/api/user/" + err.details.userId + "/verify",
    //     //             redirectTo: "/",
    //     //             redirectToLinkText: "Click here",
    //     //             userId: err.details.userId,
    //     //           });
    //     //         } else if (err.code) {
    //     //           let urlToRedirect = helperService.urlAppendParam(
    //     //             referer,
    //     //             "error",
    //     //             err.message
    //     //           );
    //     //           res.redirect(urlToRedirect);
    //     //         }
    //     //         return;
    //     //       }

    //     //       //amp
    //     //       var data = {
    //     //         event_type: "LOGIN", // required
    //     //         user_id: req.body.email, // only required if device id is not passed in
    //     //       };

    //     //       //set cookie
    //     //       res.cookie("sonicjs_access_token", token.id, {
    //     //         signed: true,
    //     //         maxAge: 30000000,
    //     //       });

    //     //       mixPanelService.setPeople(req.body.email);

    //     //       mixPanelService.trackEvent("LOGIN", req, { email: req.body.email });
    //     //       if (referer.includes("/admin?")) {
    //     //         referer = "/admin";
    //     //       }
    //     //       res.redirect(referer);
    //     //     }
    //     //   );
    //   }
    // });
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

  // getUsers: async function () {
  //   var userModel = loopback.getModel("user");
  //   let users = await userModel.find();
  //   // console.log(users);
  //   return users;
  // },

  // getUser: async function (id) {
  //   var userModel = loopback.getModel("user");
  //   let user = await userModel.findById(id);
  //   return user;
  // },

  // getRoles: async function () {
  //   var roleModel = loopback.getModel("Role");
  //   let roles = await roleModel.find();
  //   // console.log(users);
  //   return roles;
  // },

  // getRole: async function (id) {
  //   var roleModel = loopback.getModel("Role");
  //   let role = await roleModel.findById(id);
  //   return role;
  // },

  // getCurrentUserId: async function (req) {
  //   if (req.signedCookies && req.signedCookies.sonicjs_access_token) {
  //     let tokenInfo = await globalService.AccessToken.findById(
  //       req.signedCookies.sonicjs_access_token
  //     );
  //     if (tokenInfo && tokenInfo.userId) {
  //       return tokenInfo.userId;
  //     }
  //   }
  // },

  // getCurrentUser: async function (req) {
  //   var userModel = loopback.getModel("user");
  //   let a = app;
  //   let userId = await userService.getCurrentUserId(req);
  //   if (userId) {
  //     let user = await userModel.findById(userId);
  //     if (user) {
  //       return user;
  //     }
  //   }
  // },

  // isAuthenticated: async function (req) {
  //   var authCookie = await this.getToken(req);
  //   let userId = await userService.getCurrentUserId(req);
  //   if (authCookie && userId) {
  //     return true;
  //   }
  //   return false;
  // },

  // getToken: async function (req) {
  //   return req.signedCookies.sonicjs_access_token;
  // },
};
