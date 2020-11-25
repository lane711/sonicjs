'use strict';
var moduleService = require('../services/module.service');
var fileService = require('../services/file.service');

module.exports = function(Module) {

    //create
    Module.create = async function (body, cb) {

        let moduleDefinitionFile = {
            "title": body.title,
            "systemid": body.systemid,
            "version" : "0.0.0.1",
            "canBeAddedToColumn": true,
            "enabled": body.enabled === "true" ? true : false
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
            "enabled": body.enabled === "true" ? true : false,
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

    Module.getContentTypeConfig = async function (systemid, cb) {
      let obj = await moduleService.getModuleContentType(systemid);
      return obj;
      // cb(null, obj);
    };

    Module.remoteMethod("getContentTypeConfig", {
      http: {
        path: "/getContentTypeConfig",
        verb: "get",
      },
      accepts: {
        arg: "systemid",
        type: "string",
        http: {
          source: "query",
        },
      },
      returns: {
        arg: "data",
        type: "object",
      },
    });

    Module.updateJsonFile = async function (data, cb) {
      console.log('updateJsonFile', data);
      let obj = await fileService.writeFile(data.filePath, JSON.stringify(data));
      return 'ok';
    };

    Module.remoteMethod("updateJsonFile", {
      http: {
        path: "/updateJsonFile",
        verb: "put",
      },
      accepts: { arg: "data", type: "object", http: { source: "body" } },
      description: "Updates an existing content type",
      returns: {
        arg: "data",
        type: "object",
      },
    });
};
