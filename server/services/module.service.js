var dir = require("node-dir");
var path = require("path");
var fs = require("fs");
var _ = require("lodash");
var eventBusService = require("../services/event-bus.service");
var globalService = require("../services/global.service");
var fileService = require("../services/file.service");
var viewService = require("../services/view.service");
var dataService = require("../services/data.service");

module.exports = moduleService = {
  startup: function () {
    eventBusService.on("startup", async function () {
      // console.log('>>=== startup from module service');
      await moduleService.processModules();
    });

    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options) {
        options.page.data.modules = globalService.moduleDefinitions;
        options.page.data.modulesForColumns =
          globalService.moduleDefinitionsForColumns;
      }
    });
  },

  processModules: async function () {
    let dir = path.resolve(__dirname, "..", "modules");

    await this.getModuleDefinitionFiles(dir);
    await this.getModuleCss(dir);
    await this.getModuleJs(dir);
  },

  getModules: async function () {
    return globalService.moduleDefinitions;
  },

  // getModuleFolders: function (path) {
  //     dir.subdirs(path, function (err, subdirs) {
  //         if (err) throw err;
  //     });
  // },

  loadModuleServices: async function (moduleList) {
    moduleList.forEach(async function (moduleDef) {
      if (moduleDef.enabled === undefined || moduleDef.enabled === true) {
        let m = require(moduleDef.mainService);
        await m.startup();
      }
    });

    eventBusService.emit("modulesLoaded");
  },

  getModuleDefinitionFile: async function (systemid) {
    let basePath = `../server/modules/${systemid}`;
    let file = await fileService.getFile(`${basePath}/module.json`);
    return file;
  },

  getModuleDefinitionFiles: async function (path) {
    let moduleList = [];
    await dir.readFiles(
      path,
      {
        match: /module.json$/,
        exclude: /^\./,
      },
      function (err, content, next) {
        if (err) throw err;
        next();
      },
      async function (err, files) {
        if (err) throw err;

        files.forEach((file) => {
          let raw = fs.readFileSync(file);
          if (raw && raw.length > 0) {
            let moduleDef = JSON.parse(raw);
            let moduleFolder = moduleDef.systemid.replace("module-", "");
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

        await moduleService.loadModuleServices(moduleList);

        return moduleList;
      }
    );
  },

  getModuleCss: async function (path) {
    await dir.readFiles(
      path,
      {
        match: /.css$/,
        exclude: /^\./,
      },
      function (err, content, next) {
        if (err) throw err;
        next();
      },
      function (err, files) {
        if (err) throw err;

        globalService.moduleCssFiles = [];

        files.forEach((file) => {
          let link = file.substr(file.indexOf("server") + 6, file.length);
          globalService.moduleCssFiles.push(link);
        });
      }
    );
  },

  getModuleJs: async function (path) {
    await dir.readFiles(
      path,
      {
        match: /.js$/,
        exclude: /^\./,
      },
      function (err, content, next) {
        if (err) throw err;
        next();
      },
      function (err, files) {
        if (err) throw err;

        globalService.moduleJsFiles = [];

        files.forEach((file) => {
          if (file.indexOf("assets/js") > -1) {
            let link = file.substr(file.indexOf("server") + 6, file.length);
            globalService.moduleJsFiles.push(link);
          }
        });
      }
    );
  },

  processModuleInColumn: async function (options) {
    if (options.shortcode.name === options.moduleName.toUpperCase()) {
      let id = options.shortcode.properties.id;
      let contentType = options.moduleName;
      let viewPath = path.join(
        __dirname,
        `/../modules/${contentType}/views/${contentType}-main.handlebars`
      );
      let viewModel = await dataService.getContentById(id);

      options.viewModel = viewModel;

      await eventBusService.emit("postModuleGetData", options);

      var proccessedHtml = {
        id: id,
        contentType: contentType,
        shortCode: options.shortcode,
        body: await this.processView(contentType, viewModel, viewPath),
      };

      await eventBusService.emit("postProcessModuleShortCodeProccessedHtml", {
        proccessedHtml: proccessedHtml,
        viewModel: viewModel,
      });

      globalService.pageContent = globalService.pageContent.replace(
        options.shortcode.codeText,
        proccessedHtml.body
      );
    }
  },

  processView: async function (contentType, viewModel, viewPath) {
    var result = await viewService.getProccessedView(
      contentType,
      viewModel,
      viewPath
    );

    return result;
  },

  createModule: async function (moduleDefinitionFile) {
    let basePath = `../../server/modules/${moduleDefinitionFile.systemid}`;

    //create base dir
    fileService.createDirectory(`${basePath}`);

    //create sub folders
    fileService.createDirectory(`${basePath}/services`);
    fileService.createDirectory(`${basePath}/views`);
    fileService.createDirectory(`${basePath}/assets`);
    fileService.createDirectory(`${basePath}/assets/css`);
    fileService.createDirectory(`${basePath}/assets/img`);
    fileService.createDirectory(`${basePath}/assets/js`);

    //create default assets
    let defaultCssFile = `/* Css File for Module: ${moduleDefinitionFile.systemid} */`;
    fileService.writeFile(
      `${basePath}/assets/css/${moduleDefinitionFile.systemid}-module.css`,
      defaultCssFile
    );

    let defaultJsFile = `// JS File for Module: ${moduleDefinitionFile.systemid}`;
    fileService.writeFile(
      `${basePath}/assets/js/${moduleDefinitionFile.systemid}-module.js`,
      defaultJsFile
    );

    //create default view
    let defaultViewFile = `<div>Hello to you {{ data.firstName }} from the ${moduleDefinitionFile.title} module!</div>`;
    fileService.writeFile(
      `${basePath}/views/${moduleDefinitionFile.systemid}-main.handlebars`,
      defaultViewFile
    );

    //create main.js file
    moduleDefinitionFile.systemidUpperCase = moduleDefinitionFile.systemid.toUpperCase();
    moduleDefinitionFile.systemidCamelCase = _.camelCase(
      moduleDefinitionFile.systemid
    );
    let mainServiceFilePath = path.join(
      __dirname,
      "../views/js_templates/module-default-main-service.js"
    );
    var mainServiceFile = await viewService.getProccessedView(
      null,
      moduleDefinitionFile,
      mainServiceFilePath
    );
    fileService.writeFile(
      `${basePath}/services/${moduleDefinitionFile.systemid}-main-service.js`,
      mainServiceFile
    );

    //create module def file
    fileService.writeFile(
      `${basePath}/module.json`,
      JSON.stringify(moduleDefinitionFile, null, 2)
    );

    //create content type
    let moduleContentType = {
      title: `Module - ${moduleDefinitionFile.title}`,
      systemid: moduleDefinitionFile.systemid,
      canBeAddedToColumn: moduleDefinitionFile.canBeAddedToColumn
        ? true
        : false,
      data: { components: [] },
    };
    moduleContentType.data.components.push({
      label: "First Name",
      type: "textfield",
      input: true,
      key: "firstName",
      validate: { required: true },
    });
    moduleContentType.data.components.push({
      label: "Submit",
      type: "button",
      input: true,
      key: "submit",
      theme: "primary",
    });
    let ct = await dataService.createContentType(moduleContentType);
  },

  updateModule: async function (moduleDefinitionFile) {
    let basePath = `../../server/modules/${moduleDefinitionFile.systemid}`;
    fileService.writeFile(
      `${basePath}/module.json`,
      JSON.stringify(moduleDefinitionFile, null, 2)
    );
  },
};
