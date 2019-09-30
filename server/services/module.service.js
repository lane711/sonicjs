var dir = require('node-dir');
var path = require("path");
var eventBusService = require('../services/event-bus.service');
var moduleDefinitions = [];
module.exports = moduleService = {

    startup: function () {
        eventBusService.on('startup', function () {
            console.log('>>=== startup from module service');
            moduleService.processModules();
        });
    },

    processModules: function () {
        let dir = path.resolve(__dirname, '..', 'modules');

        moduleDefinitions = this.getModuleDefinitionFiles(dir);
        // let moduleFolders = this.getModuleFolders(dir);
    },

    getModules: async function () {
        return moduleDefinitions;
    },

    // getModuleFolders: function (path) {
    //     dir.subdirs(path, function (err, subdirs) {
    //         if (err) throw err;
    //     });
    // },

    getModuleDefinitionFiles: async function (path) {
        let moduleList = [];
        await dir.readFiles(path, {
            match: /module.json$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            console.log('content', content);
            let moduleDef = JSON.parse(content);
            moduleList.push(moduleDef);
            next();
        },
            function (err, files) {
                if (err) throw err;
                console.log('files', files);
                moduleDefinitions = moduleList;
                return moduleList;
            });

    },

}