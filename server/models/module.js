'use strict';
var moduleService = require('../services/module.service');

module.exports = function(Module) {

    Module.create = async function (body, cb) {

        let moduleDefinitionFile = {
            "title": body.title,
            "systemid": body.systemid,
            "version" : "0.0.0.1",
            "canBeAddedToColumn": "true"
        }

        moduleService.createModule(moduleDefinitionFile);

        return moduleDefinitionFile;
    };

    Module.remoteMethod(
        'create', {
        http: {
            path: '/',
            verb: 'post',
        },
        accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
        description: 'Creates a new module',
        returns: {
            arg: 'data',
            type: 'object',
        }
    }
    );

};
