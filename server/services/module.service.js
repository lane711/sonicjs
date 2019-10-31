var dir = require('node-dir');
var path = require("path");
var fs = require('fs');
var eventBusService = require('../services/event-bus.service');
var globalService = require('../services/global.service');



module.exports = moduleService = {

    startup: function () {
        eventBusService.on('startup', async function () {
            // console.log('>>=== startup from module service');
            await moduleService.processModules();
        });

        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options) {
                options.page.data.modules = globalService.moduleDefinitions;
            }
        });
    },

    processModules: async function () {
        let dir = path.resolve(__dirname, '..', 'modules');

        await this.getModuleDefinitionFiles(dir);
        await this.getModuleCss(dir);
        await this.getModuleJs(dir);


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

                moduleList.sort(function (a, b) {
                    if (a.title < b.title) { return -1; }
                    if (a.title > b.title) { return 1; }
                    return 0;
                })

                globalService.moduleDefinitions = moduleList;

                moduleService.loadModuleServices(moduleList);

                return moduleList;
            });

    },

    getModuleCss: async function (path) {
        await dir.readFiles(path, {
            match: /.css$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            next();
        },
            function (err, files) {
                if (err) throw err;

                globalService.moduleCssFiles = [];

                files.forEach(file => {
                    let link = file.substr(file.indexOf('/server/') + 7, file.length);
                    globalService.moduleCssFiles.push(link);
                });

            });
    },

    getModuleJs: async function (path) {
        await dir.readFiles(path, {
            match: /.js$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            next();
        },
            function (err, files) {
                if (err) throw err;

                globalService.moduleJsFiles = [];

                files.forEach(file => {
                    if (file.indexOf('assets/js') > -1) {
                        globalService.moduleJsFiles.push(file);
                    }
                });

            });
    },

}