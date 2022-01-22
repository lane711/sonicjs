var path = require("path");
var fs = require("fs");
var _ = require("lodash");
const glob = require("glob");

var emitterService = require("../services/emitter.service");
var globalService = require("../services/global.service");
var fileService = require("../services/file.service");
var viewService = require("../services/view.service");
var dataService = require("../services/data.service");
var formattingService = require("../services/formatting.service");

var appRoot = require("app-root-path");
var frontEndTheme = `${process.env.FRONT_END_THEME}`;

module.exports = moduleService = {
  startup: function (app) {
    emitterService.on("startup", async function ({app}) {
      // console.log('>>=== startup from module service');
      await moduleService.processModules(app);
    });

    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        options.page.data.modules = globalService.moduleDefinitions;
        options.page.data.modulesForColumns =
          globalService.moduleDefinitionsForColumns;
      }
    });
  },

  processModules: async function (app) {
    let moduleDir = path.join(appRoot.path, "/server/modules");

    await this.getModuleDefinitionFiles(moduleDir, app);
    await this.getModuleCss(moduleDir);
    await this.getModuleJs(moduleDir);
    await this.getModuleContentTypesConfigs(moduleDir);
  },

  getModules: async function () {
    return globalService.moduleDefinitions;
  },

  // getModuleFolders: function (path) {
  //     dir.subdirs(path, function (err, subdirs) {
  //         if (err) throw err;
  //     });
  // },

  loadModuleServices: async function (moduleList, app) {
    moduleList.forEach(async function (moduleDef) {
      if (moduleDef.enabled === undefined || moduleDef.enabled === true) {
        let m = require(moduleDef.mainService);
        await m.startup(app);
      }
    });

    emitterService.emit("modulesLoaded");
  },

  getModuleDefinition: async function (systemId) {
    let file = await moduleService.getModuleDefinitionFile(systemId);
    return JSON.parse(file);
  },

  getModuleDefinitionFile: async function (systemId) {
    let file = await fileService.getFile(
      `server/modules/${systemId}/module.json`
    );
    return file;
  },

  getModuleDefinitionFileWithPath: async function (systemId) {
    let basePath = `/server/modules/${systemId}`;
    let filePath = `${basePath}/module.json`;
    let file = await fileService.getFile(filePath);
    let moduleDef = JSON.parse(file);
    moduleDef.filePath = filePath;
    return moduleDef;
  },

  getModuleContentTypesAdmin: async function (systemId, session, req) {
    let basePath = `${appRoot.path}/server/modules/${systemId}/models`;
    // let file = await fileService.getFile(`${basePath}/module.json`);
    // return file;
    let moduleContentTypesAdmin = globalService.moduleContentTypeConfigs.filter(
      (x) => x.filePath.indexOf(`modules/${systemId}/models`) > -1
    );

    let moduleContentTypes = [];

    for (let index = 0; index < moduleContentTypesAdmin.length; index++) {
      const ct = moduleContentTypesAdmin[index];
      let contentType = await moduleService.getModuleContentType(ct.systemId, session, req);
      moduleContentTypes.push(contentType);
    }
    // moduleContentTypesAdmin.forEach(contentTypeSystemId => {
    //   let ct = await moduleService.getModuleContentType(contentTypeSystemId);
    //   moduleContentTypes.push(ct);
    // });
    // let moduleContentTypes = await moduleService.getModuleContentTypesConfigs(basePath);
    return moduleContentTypes;
  },

  contentTypeUpdate: async function (moduleContentType, session, req) {
    let moduleDef = await this.getModuleContentType(moduleContentType.systemId, session, req);

    moduleDef.canBeAddedToColumn = moduleContentType.canBeAddedToColumn;
    moduleDef.enabled = moduleContentType.enabled;
    moduleDef.systemId = moduleContentType.systemId;
    moduleDef.title = moduleContentType.title;
    moduleDef.data = moduleContentType.data;
    moduleDef.canBeAddedToColumn = moduleContentType.canBeAddedToColumn;
    moduleDef.canBeAddedToColumn = moduleContentType.canBeAddedToColumn;
    moduleDef.permissions = moduleContentType.permissions;
    moduleDef.filePath = `/server/modules/${moduleDef.moduleSystemId}/models/${moduleDef.systemId}.json`;

    let moduleDefString = JSON.stringify(moduleDef);
    await fileService.writeFile(moduleDef.filePath, moduleDefString);

    return moduleDef;
  },

  getModuleDefinitionFiles: async function (path, app) {
    const files = fileService.getFilesSearchSync(path, "/**/module.json");

    let moduleList = [];

    files.forEach((file) => {
      let raw = fileService.getFileSync(file); // fs.readFileSync(file);
      if (raw && raw.length > 0) {
        let moduleDef = JSON.parse(raw);
        let moduleFolder = file.replace("/server/modules/", "").replace("/module.json", "");
        moduleDef.mainService = `${path}\/${moduleFolder}\/services\/${moduleFolder}-main-service.js`;
        moduleList.push(moduleDef);
      }
    });

    moduleList.sort(function (a, b) {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    });

    let moduleDefinitionsForColumns = moduleList;

    globalService.moduleDefinitions = moduleList;
    globalService.moduleDefinitionsForColumns = moduleList.filter(
      (x) => x.canBeAddedToColumn == true
    );

    await moduleService.loadModuleServices(moduleList, app);

    return moduleList;
  },

  getModuleContentTypesConfigs: async function (path) {
    let moduleCount = 0;

    const files = fileService.getFilesSearchSync(path, "/**/*.json");

    globalService.moduleContentTypeConfigs = [];

    files.forEach((file) => {
      if (file.indexOf("models") > -1) {
        moduleCount++;
        let contentTypeRaw = fileService.getFileSync(file);
        if (contentTypeRaw) {
          let contentType = JSON.parse(contentTypeRaw);
          // console.log(contentType);
          let contentTypeInfo = {
            filePath: file.replace(`/${appRoot.path}/g`, ""),
            systemId: contentType.systemId,
          };
          // console.log('==> moduleContentTypeConfigs push ', contentTypeInfo);
          globalService.moduleContentTypeConfigs.push(contentTypeInfo);
        } else {
          console.log("error on " + file);
        }
      }
    });
    return moduleCount;
  },

  getModuleContentType: async function (contentTypeSystemId, session, req) {
    if (req) {
      let =
      rootDomain = `${req.protocol}://${req.get('host')}`;
      let configInfo = await globalService.moduleContentTypeConfigs.filter(
        (x) => x.systemId === contentTypeSystemId
      );
      if (configInfo[0]) {
        let config = fileService.getFileSync(configInfo[0].filePath);
        config = config.replace('http://localhost:3018', rootDomain);
        let contentType = JSON.parse(config);
        return contentType;
      }
    }
    return {};
  },

  getModuleContentTypes: async function (userSession, req) {
    let =
    rootDomain = `${req.protocol}://${req.get('host')}`;
    let configInfos = await globalService.moduleContentTypeConfigs;
    let configs = [];
    configInfos.forEach((configInfo) => {
      let config = fileService.getFileSync(configInfo.filePath);
      config = config.replace('http://localhost:3018', rootDomain);
      let configObj = JSON.parse(config);
      configs.push(configObj);
    });
    return configs;
  },

  updateModuleContentType: async function (contentTypeDef) {
    let path = contentTypeDef.filePath;
  },

  createModuleContentType: async function (contentTypeDef) {
    // console.log("creating content type", contentTypeDef);
    contentTypeDef.filePath = `/server/modules/${contentTypeDef.moduleSystemId}/models/${contentTypeDef.systemId}.json`;
    contentTypeDef.title = contentTypeDef.title
      ? contentTypeDef.title
      : contentTypeDef.moduleSystemId;
    contentTypeDef.data = {components: []};
    let contentTypeDefObj = JSON.stringify(contentTypeDef);
    await fileService.writeFile(contentTypeDef.filePath, contentTypeDefObj);
    //reload modules
    await moduleService.processModules();

    return contentTypeDef;
  },

  deleteModuleContentType: async function (moduleContentTypeSystemid) {
    console.log("deleting content type", moduleContentTypeSystemid);
    let filePath = await fileService.getFilesSearchSync(
      `${appRoot.path}/server/modules/`,
      `/**/*${moduleContentTypeSystemid}.json`
    );

    let fullPath = path.join(appRoot.path, filePath[0]);
    fileService.deleteFile(fullPath);

    //reload modules
    await moduleService.processModules();
  },

  getModuleCss: async function (path) {
    const files = fileService.getFilesSearchSync(path, "/**/*.css");

    globalService.moduleCssFiles = [];

    files.forEach((file) => {
      let link = file.substr(file.indexOf("server") + 6, file.length);
      globalService.moduleCssFiles.push(link);
    });
  },

  getModuleJs: async function (path) {
    const files = fileService.getFilesSearchSync(path, "/**/*.js");

    globalService.moduleJsFiles = [];

    files.forEach((file) => {
      if (file.indexOf("assets/js") > -1) {
        let link = file.substr(file.indexOf("server") + 6, file.length);
        globalService.moduleJsFiles.push(link);
      }
    });
  },

  getModuleViewFile: async function (contentType) {
    //see if theme level override exists

    let viewPath = `/server/modules/${contentType}/views/${contentType}-main.hbs`;

    let themeViewPath = `/server/themes/front-end/${frontEndTheme}/modules/${contentType}/views/${contentType}-main.hbs`;

    if (await fileService.fileExists(themeViewPath)) {
      viewPath = themeViewPath;
    }
    return viewPath;
  },

  processModuleInColumn: async function (options, viewModel) {
    if (options.shortcode.name === options.moduleName.toUpperCase()) {
      let id = options.shortcode.properties.id;
      let contentType = options.moduleName;
      let viewPath = await this.getModuleViewFile(options.moduleName);
      options.viewModel = viewModel
        ? viewModel
        : await dataService.getContentById(id, options.req.sessionID);

      await emitterService.emit("postModuleGetData", options);

      var processedHtml = {
        id: id,
        contentType: contentType,
        shortCode: options.shortcode,
        body: await this.processView(contentType, options.viewModel, viewPath),
      };

      //for template based pages
      if (options.page && options.page.data.pageTemplate) {
        if (options.shortcode.name !== "PAGE-TEMPLATES") {
          let wrappedDiv = formattingService.generateModuleDivWrapper(
            options.shortcode.properties.id,
            "module",
            "",
            options.shortcode.name,
            contentType,
            processedHtml.body,
            true,
            options.page.data.pageTemplate !== 'none'
          );
          options.page.data.currentShortCodeHtml += wrappedDiv;
        } else {
          options.page.data.currentShortCodeHtml += processedHtml.body;
        }
      }

      options.processedHtml = processedHtml;
      await emitterService.emit("postProcessModuleShortCodeProcessedHtml", {
        options
      });

      options.page.data.html = options.page.data.html.replace(
        options.shortcode.codeText,
        processedHtml.body
      );
    }
  },

  processView: async function (contentType, viewModel, viewPath) {
    var result = await viewService.getProcessedView(
      contentType,
      viewModel,
      viewPath
    );

    return result;
  },

  createModule: async function (moduleDefinitionFile) {
    let basePath = `/server/modules/${moduleDefinitionFile.systemId}`;

    moduleDefinitionFile.version = "0.0.0.1";

    //create base dir
    fileService.createDirectory(`${basePath}`);

    //create sub folders
    fileService.createDirectory(`${basePath}/services`);
    fileService.createDirectory(`${basePath}/models`);
    fileService.createDirectory(`${basePath}/views`);
    fileService.createDirectory(`${basePath}/assets`);
    fileService.createDirectory(`${basePath}/assets/css`);
    fileService.createDirectory(`${basePath}/assets/img`);
    fileService.createDirectory(`${basePath}/assets/js`);

    //create default assets
    let defaultCssFile = `/* Css File for Module: ${moduleDefinitionFile.systemId} */`;
    fileService.writeFile(
      `${basePath}/assets/css/${moduleDefinitionFile.systemId}-module.css`,
      defaultCssFile
    );

    let defaultJsFile = `// JS File for Module: ${moduleDefinitionFile.systemId}`;
    fileService.writeFile(
      `${basePath}/assets/js/${moduleDefinitionFile.systemId}-module.js`,
      defaultJsFile
    );

    //create default view
    let defaultViewFile = `<div>Hello to you {{ data.firstName }} from the ${moduleDefinitionFile.title} module!</div>`;
    fileService.writeFile(
      `${basePath}/views/${moduleDefinitionFile.systemId}-main.hbs`,
      defaultViewFile
    );

    //create main.js file
    moduleDefinitionFile.systemidUpperCase = moduleDefinitionFile.systemId.toUpperCase();
    moduleDefinitionFile.systemidCamelCase = _.camelCase(
      moduleDefinitionFile.systemId
    );
    let mainServiceFilePath =
      "/server/assets/js/module-default-main-service.js";

    var mainServiceFile = await viewService.getProcessedView(
      null,
      moduleDefinitionFile,
      mainServiceFilePath
    );
    fileService.writeFile(
      `${basePath}/services/${moduleDefinitionFile.systemId}-main-service.js`,
      mainServiceFile
    );

    //create module def file
    fileService.writeFile(
      `${basePath}/module.json`,
      JSON.stringify(moduleDefinitionFile, null, 2)
    );

    //create default content type
    let contentTypeDef = {
      moduleSystemId: moduleDefinitionFile.systemId,
      systemId: moduleDefinitionFile.systemId,
      title: moduleDefinitionFile.title,
      data: {components: []},
    };

    contentTypeDef.data.components.push({
      label: "Title",
      type: "textfield",
      input: true,
      key: "title",
      validate: {required: true},
    });
    contentTypeDef.data.components.push({
      label: "Submit",
      type: "button",
      input: true,
      key: "submit",
      theme: "primary",
    });

    await moduleService.createModuleContentType(contentTypeDef);

    //create settings content type
    let contentTypeDefSettings = {
      moduleSystemId: moduleDefinitionFile.systemId,
      systemId: `${moduleDefinitionFile.systemId}-settings`,
      title: `${moduleDefinitionFile.title} Settings`,
      data: {components: []},
    };

    contentTypeDefSettings.data.components.push({
      label: "Enabled",
      type: "checkbox",
      input: true,
      key: "enabled",
      defaultValue: true
    });
    contentTypeDefSettings.data.components.push({
      label: "Submit",
      type: "button",
      input: true,
      key: "submit",
      theme: "primary",
    });

    await moduleService.createModuleContentType(contentTypeDefSettings);
  },

  updateModule: async function (moduleDefinitionFile) {
    let basePath = `server/modules/${moduleDefinitionFile.systemId}`;
    await fileService.writeFile(
      `${basePath}/module.json`,
      JSON.stringify(moduleDefinitionFile, null, 2)
    );
    await moduleService.processModules();
  },

  deleteModule: async function (moduleSystemId) {
    if (moduleSystemId) {
      let modulePath = path.join(
        appRoot.path,
        `/server/modules/${moduleSystemId}`
      );
      await fileService.deleteDirectory(modulePath);
      await moduleService.processModules();
    }
    return true;
  },
};
