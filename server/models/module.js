"use strict";
var moduleService = require("../services/module.service");
var fileService = require("../services/file.service");
var emitterService = require("../services/emitter.service");

module.exports = function (Module) {
  //create
  Module.create = async function (body, cb) {
    let moduleDefinitionFile = {
      title: body.title,
      systemid: body.systemid,
      version: "0.0.0.1",
      canBeAddedToColumn: body.canBeAddedToColumn,
      enabled: body.enabled,
    };

    moduleService.createModule(moduleDefinitionFile);

    return moduleDefinitionFile;
  };

  Module.remoteMethod("create", {
    http: {
      path: "/",
      verb: "post",
    },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    description: "Creates a new module",
    returns: {
      arg: "data",
      type: "object",
    },
  });

  //update
  Module.update = async function (body, cb) {
    let moduleDefinitionFile = {
      title: body.title,
      systemid: body.systemid,
      version: "0.0.0.1",
      enabled: body.enabled === "true" ? true : false,
      canBeAddedToColumn: body.canBeAddedToColumn,
      singleInstance: body.singleInstance,
    };

    moduleService.updateModule(moduleDefinitionFile);

    return moduleDefinitionFile;
  };

  Module.remoteMethod("update", {
    http: {
      path: "/",
      verb: "put",
    },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    description: "Updates an existing module",
    returns: {
      arg: "data",
      type: "object",
    },
  });

  Module.getContentTypeConfig = async function (systemid, cb) {
    let contentType = await moduleService.getModuleContentType(systemid);

    await emitterService.emit("contentTypeLoaded", contentType);

    return contentType;
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

  Module.getModuleContentTypes = async function (cb) {
    let obj = await moduleService.getModuleContentTypes();
    // console.log(obj);
    return obj;
    // cb(null, obj);
  };

  Module.remoteMethod("getModuleContentTypes", {
    http: {
      path: "/getModuleContentTypes",
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
    let obj = JSON.stringify(data);
    let def = await moduleService.getModuleDefinitionFile(data.systemid);
    //TODO need coorect file path to pass in
    await fileService.writeFile(data.filePath, obj);
    return data;
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

  //create module content type
  Module.createModuleContentType = async function (body, cb) {
    let moduleDefinitionFile = {
      title: body.title,
      systemid: body.systemid,
      moduleSystemid: body.moduleSystemid,
    };

    let newContentType = await moduleService.createModuleContentType(
      moduleDefinitionFile
    );

    return newContentType;
  };

  Module.remoteMethod("createModuleContentType", {
    http: {
      path: "/createModuleContentType",
      verb: "post",
    },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    description: "Creates a new module content type",
    returns: {
      arg: "data",
      type: "object",
    },
  });

  //delete module content type
  Module.deleteModuleContentType = async function (body, cb) {
    let newContentType = await moduleService.deleteModuleContentType(
      body.systemid
    );

    return newContentType;
  };

  Module.remoteMethod("deleteModule", {
    http: {
      path: "/deleteModuleContentType",
      verb: "post",
    },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    description: "Creates a new module content type",
    returns: {
      arg: "data",
      type: "object",
    },
  });

  //delete module
  Module.deleteModule = async function (body, cb) {
    let status = await moduleService.deleteModule(
      body.moduleSystemid
    );

    return status;
  };

  Module.remoteMethod("deleteModule", {
    http: {
      path: "/deleteModule",
      verb: "post",
    },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    description: "Creates a new module content type",
    returns: {
      arg: "data",
      type: "object",
    },
  });
};
