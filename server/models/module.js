'use strict';
var moduleService = require('../services/module.service');

module.exports = function(Module) {

    //create
    Module.create = async function (body, cb) {

        let moduleDefinitionFile = {
            "title": body.title,
            "systemid": body.systemid,
            "version" : "0.0.0.1",
            "canBeAddedToColumn": true,
            "enabled": "true"
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

    //update
    Module.update = async function (body, cb) {

        let moduleDefinitionFile = {
            "title": body.title,
            "systemid": body.systemid,
            "version" : "0.0.0.1",
            "enabled": body.enabled,
            "canBeAddedToColumn": body.canBeAddedToColumn,
            "singleInstance": body.singleInstance
        }

        moduleService.updateModule(moduleDefinitionFile);

        return moduleDefinitionFile;
    };

    Module.remoteMethod(
        'update', {
        http: {
            path: '/',
            verb: 'put',
        },
        accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
        description: 'Updates an existing module',
        returns: {
            arg: 'data',
            type: 'object',
        }
    }
    );

};
