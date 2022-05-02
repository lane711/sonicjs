// var dataService = require('./data.service');
// var sanitizeHtml = require('sanitize-html');

// var fs = require('fs');
// // const axios = require('axios');
// const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
// const chalk = require('chalk');
// const log = console.log;

// import FormioForm from 'formiojs/form';

// import { Form } from 'formiojs';

// const {f} = require('formiojs');
// var formio = require('formio-service')();
// var Form = formio.Form;

// const utils = require('formiojs/utils');

(function (exports) {
  var verboseLogging = false;
  if (typeof module !== "undefined" && module.exports) {
    var helperService = require("./helper.service");
     verboseLogging = process.env.APP_LOGGING === "verbose";
  } else {
    //client version
  }


  (exports.truncateString = function (body, length) {
    if (body) {
      let cleanHtml = body.substring(0, 450);
      // if(sanitizeHtml){
      //     cleanHtml = sanitizeHtml(body, {
      //         allowedTags: [],
      //         allowedAttributes: false
      //     });
      // }

      return cleanHtml.length > length
        ? cleanHtml.substr(0, length - 1) + "..."
        : cleanHtml;
    }
  }),
    (exports.urlAppendParam = function (url, paramName, paramValue) {
      let baseUrl = url;
      if (url.indexOf("?") > -1) {
        baseUrl = url.substring(0, url.indexOf("?"));
      }
      return `${baseUrl}?${paramName}=${paramValue}`;
    }),
    (exports.sleep = function (ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }),
    (exports.generateRandomString = function (length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }),
    (exports.getCookie = function (name) {
      // debugger;
      if (typeof document !== "undefined" && document && document.cookie) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
          return parts.pop().split(";").shift();
        }
      }
    });
  exports.slugify = function (text) {
    // console.log('slug', text);
    let slug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    return slug;
  };
  exports.validateEmail = function (email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  exports.generateSlugFromContent = function (
    content,
    includePrecedingSlash = false,
    makeUnique = false
  ) {
    let copy = content.title;
    if (!copy) copy = content.text;
    if (!copy) copy = content.body;
    if (!copy) copy = content.alertCopy;
    if (!copy) copy = content.contentType;

    let slug = this ? this.slugify(copy) : slugify(copy);

    if (verboseLogging) {
      console.log("generateSlugFromContent slug ===>", slug);
    }

    if (includePrecedingSlash === true) {
      slug = `/${slug}`;
    }

    if (makeUnique === true) {
      slug = `${slug}-${this.generateRandomString(6)}`;
    }

    if (verboseLogging) {
      console.log("generateSlugFromContent slug final ===>", slug);
    }

    return slug;
  };
})(typeof exports === "undefined" ? (this["helperService"] = {}) : exports);

// (function (exports) {

//     var isAdminUserCreated = false;
//     var axiosInstance;
//     var baseUrl;
//     var authToken;
//     var pageContent = 'temp';
//     var moduleDefinitions = [];
//     var moduleDefinitionsForColumns = [];
//     var moduleCssFiles = [];
//     var moduleJsFiles = [];

//     // your code goes here

//     exports.test = function () {
//         return 'hello world'
//     };

// })(typeof exports === 'undefined' ? this['globalService'] = {} : exports);
