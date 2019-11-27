var eventBusService = require('./event-bus.service');
   
var baseUrl;
var pageContent;
var moduleDefinitions = [];
var moduleDefinitionsForColumns = [];
var moduleCssFiles = [];
var moduleJsFiles = [];

// var isAdminUserCreated = false;
// module.exports.globalService.isAdminUserCreated = isAdminUserCreated;
// 

module.exports = globalService = {

    isAdminUserCreated: false,
    axiosInstance: undefined,

    startup: async function () {
        eventBusService.on('requestBegin', async function (options) {
            // console.log('global startup')
            if(options){
                baseUrl = `${options.req.protocol}://${options.req.headers.host}`;
            }
        });
    },

    getBaseUrl: function () {
        return baseUrl;
    }

}

