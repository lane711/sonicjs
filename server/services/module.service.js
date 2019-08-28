var dir = require('node-dir');
var path = require("path");

module.exports = {

    loadModules: function () {
        console.log("loaded modules");
        this.processModules();
    },

    processModules: function () {
        let dir = path.resolve(__dirname, '..', 'modules');

        this.getModuleDefinitionFiles(dir);
        // let path = __dirname + '/../modules';
        let moduleFolders = this.getModuleFolders(dir);
        console.log('moduleFolders', moduleFolders);
    },

    getModuleFolders: function (path) {
        console.log('fining:' + path)
        dir.subdirs(path, function(err, subdirs) {
            if (err) throw err;
            console.log('subdirs', subdirs);
        });
    },

    getModuleDefinitionFiles: function (path) {
        dir.readFiles(path, {
            match: /module.json$/,
            exclude: /^\./
            }, function(err, content, next) {
                if (err) throw err;
                console.log('content:', content);
                next();
            },
            function(err, files){
                if (err) throw err;
                console.log('finished reading files:',files);
            });
    },

}