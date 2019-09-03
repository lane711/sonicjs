var dir = require('node-dir');
var path = require("path");
var eventBusService = require('../services/event-bus.service');

// class moduleService {
//     constructor(projects) {
//         // this.projects = projects;
//         // this.getProject('test88');
//         console.log('---> module service constructor')
//     }

//     getProject(name) {
//         return this.projects[name];
//     }
// }



// module.exports = moduleService;

// mex.this.startup();

// var x = loadModules();

// (async () => {
//     // page = await themes.getTheme();
//     // page = this.contentService.getPage('5cdb5cc2f744441df910f43f', null);
//     console.log('asunc module service ==>');

//     eventBusService.on('startup', function () {
//         console.log('=== startup from module service');
//         this.startup();
//     });

//     console.log('==== module service subscriptions complete ==>');


// })();

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
        // let path = __dirname + '/../modules';
        let moduleFolders = this.getModuleFolders(dir);
        // console.log('moduleFolders', moduleFolders);
    },

    getModuleFolders: function (path) {
        // console.log('finding module at:' + path)
        dir.subdirs(path, function (err, subdirs) {
            if (err) throw err;
            // console.log('subdirs', subdirs);
        });
    },

    getModuleDefinitionFiles: function (path) {
        dir.readFiles(path, {
            match: /module.json$/,
            exclude: /^\./
        }, function (err, content, next) {
            if (err) throw err;
            // console.log('content:', content);
            next();
        },
            function (err, files) {
                if (err) throw err;
                // console.log('finished reading files:',files);
            });
    },

}