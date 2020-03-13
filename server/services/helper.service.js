// var dataService = require('./data.service');
// var sanitizeHtml = require('sanitize-html');

// var fs = require('fs');
// const cheerio = require('cheerio')
// const axios = require('axios');
// const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
// const chalk = require('chalk');
// const log = console.log;

// import FormioForm from 'formiojs/form';

// import { Form } from 'formiojs';

// const {f} = require('formiojs');
// var formio = require('formio-service')();
// var Form = formio.Form;

// const utils = require('formiojs/utils');

(function(exports) {
  (exports.truncateString = function(body, length) {
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
    (exports.urlAppendParam = function(url, paramName, paramValue) {
      let baseUrl = url;
      if (url.indexOf("?") > -1) {
        baseUrl = url.substring(0, url.indexOf("?"));
      }
      return `${baseUrl}?${paramName}=${paramValue}`;
    }),
    (exports.sleep = function(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }),
    (exports.generateRandomString = function(length) {
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
    (exports.getCookie = function(name) {
      // debugger;
      if (typeof document !== 'undefined' && document && document.cookie) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
          return parts
            .pop()
            .split(";")
            .shift();
        }
      }
    });
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
