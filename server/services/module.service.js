var dir = require('node-dir');
var path = require("path");
var fs = require('fs');
var eventBusService = require('../services/event-bus.service');
var moduleDefinitions = [];

module.exports = moduleService = {

    startup: function () {
        eventBusService.on('startup', async function () {
            // console.log('>>=== startup from module service');
            await moduleService.processModules();
        });

        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options) {
                options.page.data.modules = moduleDefinitions;
            }
        });
    },

    processModules: async function () {
        let dir = path.resolve(__dirname, '..', 'modules');

        await this.getModuleDefinitionFiles(dir);

        },

    getModules: async function () {
        return moduleDefinitions;
    },

    // getModuleFolders: function (path) {
    //     dir.subdirs(path, function (err, subdirs) {
    //         if (err) throw err;
    //     });
    // },

    
    loadModuleServices: async function (moduleList) {
        moduleList.forEach(moduleDef => {
            let m = require(moduleDef.mainService);
            m.startup();
        });
    },

    getModuleDefinitionFiles: async function (path) {
        let moduleList = [];
        await dir.readFiles(path, {
            match: /module.json$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            next();
        },
            function (err, files) {
                if (err) throw err;

                files.forEach(file => {
                    let raw = fs.readFileSync(file);
                    let moduleDef = JSON.parse(raw);
                    let moduleFolder = moduleDef.systemid.replace('module-', '');
                    moduleDef.mainService = `${path}\/${moduleFolder}\/services\/main.js`;
                    moduleList.push(moduleDef);
                });

                moduleList.sort(function(a, b){
                    if(a.title < b.title) { return -1; }
                    if(a.title > b.title) { return 1; }
                    return 0;
                })

                moduleDefinitions = moduleList;

                moduleService.loadModuleServices(moduleList);

                return moduleList;
            });

    },

}