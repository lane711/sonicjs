var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");
var globalService = require("./global.service");
// var loopback = require("loopback");
// var app = loopback();
var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
var { GraphQLClient, gql, request } = require("graphql-request");
var frontEndTheme = `${process.env.FRONT_END_THEME}`;
const adminTheme = `${process.env.ADMIN_THEME}`;

module.exports = userService = {
  startup: async function () {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        options.page.data.showPageBuilder = await userService.isAuthenticated(
          options.req
        );
      }
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

    emitterService.on("postBegin", async function (options) {
      if (options.req.url === "/register") {
        // var user = loopback.getModel("user");
        let email = options.req.body.email;
        let password = options.req.body.password;
        let passwordConfirm = options.req.body.passwordConfirm;

        let newUser = await userService.createUser(email, password);

        globalService.isAdminUserCreated = true;
        let message = encodeURI(`Account created successfully. Please login`);
        res.redirect(`/admin?message=${message}`); // /admin will show the login
        return;
      }
    });


    emitterService.on("requestBegin", async function (options) {
      if (options.req.url === "/login") {
        options.req.isRequestAlreadyHandled = true;

        // res.render("admin/shared-views/admin-login", { layout: `front-end/${frontEndTheme}/login.handlebars`, data: data });


        let data = { registerMessage: "<b>admin</b>" };
        options.res.render("admin/shared-views/admin-login", {
          layout: `front-end/${frontEndTheme}/login.handlebars`,
          data: data,
        });

        // options.res.sendFile(file);
        // options.req.isRequestAlreadyHandled = true;
        // return;
      }
    });


    emitterService.on("postBegin", async function (options) {

      if (options.req.url === "/login") {

        let email = options.req.body.email;
        let password = options.req.body.password;
        console.log(email, password);

        // var user = app.models.User;
        let referer = req.headers.referer;
    
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

      }

      
    });

  },

  createUser: async function (email, password) {
    const query = gql`
    mutation{
      addUser(email:"${email}", password:"${password}"){
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
