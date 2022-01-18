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
// const User = require("../schema/models/user");
const dalService = require("./dal.service");

var frontEndTheme = `${process.env.FRONT_END_THEME}`;
const adminTheme = `${process.env.ADMIN_THEME}`;

module.exports = userService = {
  startup: async function (app) {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        options.page.data.showPageBuilder = await userService.isAuthenticated(
          options.req
        );
      }
    });

    app.get("/api-admin/roles", async function (req, res) {
      let data = await dataService.rolesGet(req.sessionID);
      let roles = data.map((r) => {
        return { id: r.data.key, name: r.data.title };
      });
      res.send(roles);
    });
  },

  registerUser: async function (email, password, isAdmin = false) {
    let passwordHash = await dalService.hashPassword(password);

    return await dalService.userRegister(email, passwordHash, isAdmin);
    // User.register({ username: username, active: false }, password);
    // let passwordHash = crypto.createHash('md5').update('password').digest("hex")

    // const query = gql`
    // mutation{
    //   userCreate(email:"${email}", password:"${passwordHash}"){
    //     email
    //     id
    //   }
    // }
    //   `;

    // let data = await dataService.executeGraphqlQuery(query);

    // return data.contents;
  },

  loginUser: async function (email, password) {
    return await dalService.userGetByLogin(email, password);
    // const query = gql`
    //   mutation{
    //     userCreate(email:"${email}", password:"${password}"){
    //       email
    //       id
    //     }
    //   }
    //     `;

    // let data = await dataService.executeGraphqlQuery(query);

    // return data.contents;
  },

  getUsers: async function (sessionID) {
    const query = gql`
      {
        users (sessionID:"${sessionID}") {
          id
          username
          password
        }
      }
    `;

    let data = await dataService.executeGraphqlQuery(query);

    return data.users;
  },

  getUser: async function (id, sessionID) {
    const query = gql`
    {
      user(id:"${id}", sessionID:"${sessionID}"){
        id
        username
        lastLoginOn
        profile
      }
      }
        `;

    let data = await dataService.executeGraphqlQuery(query);

    return data.user;
  },

  getRoles: async function (sessionID) {
    let data = await dataService.getContentByContentType("role", sessionID);

    return data;
  },

  mapUserRoles: async function (user) {
    let roles = await userService.getRoles();

    if (user.profile.roles) {
      user.roleMapping = [];
      user.profile.roles.forEach((role) => {
        let roleRecord = roles.filter((x) => x.id === role);
        if (roleRecord) {
          user.roleMapping.push(roleRecord[0].data.title);
        }
      });
    }

    return data;
  },

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

  isAuthenticated: async function (req) {
    // console.log("user account", req.user);
    if (req.user && req.user.username) {
      return true;
    }
    return false;
  },

  // getToken: async function (req) {
  //   return req.signedCookies.sonicjs_access_token;
  // },
};
