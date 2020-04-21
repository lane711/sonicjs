(function (exports) {
  var isAdminUserCreated = false;
  var axiosInstance;
  var baseUrl;
  var pageContent = "temp";
  var moduleDefinitions = [];
  var moduleDefinitionsForColumns = [];
  var moduleCssFiles = [];
  var moduleJsFiles = [];
  var AccessToken;
  var isRequestAlreadyHandled = false;
  var isBackEnd = false;
  var isFrontEnd = false;
  var isPageBuilder = false;
  var path;

  if (typeof module !== "undefined" && module.exports) {

  } else {
    //client version
  }

  exports.test = function () {
    return "hello world";
  };

  exports.getAppVersion = function () {
    const path = require("path");
    let packageJsonPath = path.join(__dirname, "../..", "package.json");
    var pjson = require(packageJsonPath);
    if (pjson) {
      return pjson.version;
    }
  };

  exports.asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  exports.setAreaMode = function (
    isBackEnd = false,
    isFrontEnd = false,
    isAuthenticated = false
  ) {
    this.isBackEnd = isBackEnd;
    this.isFrontEnd = isFrontEnd;
    this.isPageBuilder = isFrontEnd && isAuthenticated;
  };
})(typeof exports === "undefined" ? (this["globalService"] = {}) : exports);

// var eventBusService = require('./event-bus.service');
// var os = require("os");

// // var baseUrl;
// var pageContent;
// var moduleDefinitions = [];
// var moduleDefinitionsForColumns = [];
// var moduleCssFiles = [];
// var moduleJsFiles = [];

// // var isAdminUserCreated = false;
// // module.exports.globalService.isAdminUserCreated = isAdminUserCreated;
// //

// module.exports = globalService = {

//     isAdminUserCreated: false,
//     axiosInstance: undefined,
//     baseUrl: undefined,
//     authToken: undefined,

//     startup: async function () {
//         eventBusService.on('requestBegin', async function (options) {
//             // console.log('global startup')
//             if(options){
//                 // baseUrl = `${options.req.protocol}://${options.req.headers.host}`;
//             }
//         });
//     },

//     getBaseUrl: function () {
//         return globalService.baseUrl;
//     }

// }
