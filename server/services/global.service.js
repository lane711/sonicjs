(function (exports) {
  const isAdminUserCreated = false
  let axiosInstance
  let baseUrl
  const moduleDefinitions = []
  const moduleDefinitionsForColumns = []
  const moduleCssFiles = []
  const moduleJsFiles = []
  const moduleContentTypeConfigs = []
  let AccessToken
  const isRequestAlreadyHandled = false
  const isBackEnd = false
  const isFrontEnd = false
  const isPageBuilder = false
  let path

  if (typeof module !== 'undefined' && module.exports) {

  } else {
    // client version
  }

  exports.isBackEnd = function () {
    return window.location.pathname.startsWith('/admin')
  }

  exports.getAppVersion = function () {
    const path = require('path')
    const packageJsonPath = path.join(__dirname, '../..', 'package.json')
    const pjson = require(packageJsonPath)
    if (pjson) {
      return pjson.version
    }
  }

  exports.asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  exports.setAreaMode = function (
    isBackEnd = false,
    isFrontEnd = false,
    isAuthenticated = false
  ) {
    this.isBackEnd = isBackEnd
    this.isFrontEnd = isFrontEnd
    this.isPageBuilder = isFrontEnd && isAuthenticated
  }
})(typeof exports === 'undefined' ? (this.globalService = {}) : exports)

// var emitterService = require('./emitter.service');
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
//         emitterService.on('requestBegin', async function (options) {
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
