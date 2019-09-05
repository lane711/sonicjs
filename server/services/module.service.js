var dir = require('node-dir');
var path = require("path");
var eventBusService = require('../services/event-bus.service');

module.exports = moduleService = {

    startup: function () {
        eventBusService.once('startup', function () {
            // console.log('>>=== startup from module service');
            moduleService.processModules();
        });
    },

    processModules: function () {
        let dir = path.resolve(__dirname, '..', 'modules');

        this.getModuleDefinitionFiles(dir);
        let moduleFolders = this.getModuleFolders(dir);
    },

    getModuleFolders: function (path) {
        dir.subdirs(path, function (err, subdirs) {
            if (err) throw err;
        });
    },

    getModuleDefinitionFiles: function (path) {
        dir.readFiles(path, {
            match: /module.json$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            next();
        },
            function (err, files) {
                if (err) throw err;
            });
    },

}