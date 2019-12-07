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



(function (exports) {

    var isAdminUserCreated = false;
    var axiosInstance;
    var baseUrl;
    var authToken;
    var pageContent = 'temp';
    var moduleDefinitions = [];
    var moduleDefinitionsForColumns = [];
    var moduleCssFiles = [];
    var moduleJsFiles = [];

    // your code goes here

    exports.test = function () {
        return 'hello world'
    };

})(typeof exports === 'undefined' ? this['globalService'] = {} : exports);