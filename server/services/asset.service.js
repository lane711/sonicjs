var globalService = require("./global.service");
var eventBusService = require("./event-bus.service");
var fileService = require("./file.service");
var dataService = require("./data.service");
const path = require("path");
var UglifyJS = require("uglify-es");
var csso = require("csso");
var fileName = {};

module.exports = assetService = {
  startup: async function () {
    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options && options.page) {
        options.page.data.jsLinks = "";
        options.page.data.cssLinks = "";

        let assetFilesExist = await assetService.doesAssetFilesExist();

        if (assetFilesExist && process.env.MODE === "production") {
          //add combined assets
          options.page.data.jsLinks = `<script src="/js/${assetService.getCombinedFileName(
            "js"
          )}"></script>`;
          options.page.data.cssLinks = `<link href="/css/${assetService.getCombinedFileName(
            "css"
          )}" rel="stylesheet">`;
        } else {
          await assetService.getLinks(options, "js");
          await assetService.getLinks(options, "css");
        }
      }
    });

    eventBusService.on("requestBegin", async function (options) {
      //handle combined js file
      if (process.env.MODE !== "production") return;

      if (
        options.req.url.startsWith("/js/combined-") ||
        options.req.url.startsWith("/css/combined-")
      ) {
        let assetType = options.req.url.includes("/js/") ? "js" : "css";
        let appVersion = globalService.getAppVersion();
        let fileName = assetService.getCombinedFileName(assetType);

        let file = path.join(
          __dirname,
          "..",
          assetService.getCombinedAssetPath(assetType, fileName)
        );

        options.res.setHeader("Cache-Control", "public, max-age=2592000");
        options.res.setHeader(
          "Expires",
          new Date(Date.now() + 2592000000).toUTCString()
        );
        options.res.sendFile(file);
        options.req.isRequestAlreadyHandled = true;
        return;
      }
    });
  },

  doesAssetFilesExist: async function (fileName) {
    let cssPath = this.getAssetPath(this.getCombinedFileName("css"));
    let jsPath = this.getAssetPath(this.getCombinedFileName("js"));
    return fileService.fileExists(cssPath) && fileService.fileExists(cssPath);
  },

  getCombinedAssetPath: function (assetType, fileName) {
    return `/assets/${assetType}/${fileName}`;
  },

  getLinks: async function (options, assetType) {
    options.page.data.links = {};
    options.page.data.links[assetType] = [];

    await this.getAssets(options, assetType);

    await this.processLinksForProdMode(options, assetType);

    await this.processLinksForDevMode(options, assetType);
  },

  getAssets: async function (options, assetType) {
    let paths = [];
    if (globalService.isBackEnd) {
      let assets = await dataService.getContentByContentTypeAndTitle(
        "asset",
        `${assetType}-back-end`
      );
      this.addPaths(options, assets.data.paths, assetType);
    }

    if (globalService.isFrontEnd) {
      let assets = await dataService.getContentByContentTypeAndTitle(
        "asset",
        `${assetType}-front-end`
      );
      this.addPaths(options, assets.data.paths, assetType);
    }

    //add module js files
    if (assetType === "js") {
      await globalService.asyncForEach(
        globalService.moduleJsFiles,
        async (path) => {
          this.addPath(options, { path: path }, assetType);
        }
      );
    }

    //add module css files
    if (assetType === "css") {
      await globalService.asyncForEach(
        globalService.moduleCssFiles,
        async (path) => {
          this.addPath(options, { path: path }, assetType);
        }
      );
    }
  },

  addPaths: function (options, paths, assetType) {
    paths.forEach((path) => {
      let skipAsset =
        path.pageBuilderOnly && !options.page.data.showPageBuilder;
      if (!skipAsset) {
        this.addPath(options, path, assetType);
      }
    });
  },

  addPath: function (options, path, assetType) {
    try {
      options.page.data.links[assetType].push(path);
    } catch (error) {
      console.log(error);
    }
  },

  processLinksForDevMode: async function (options, assetType) {
    if (process.env.MODE === "production") return;

    await globalService.asyncForEach(
      options.page.data.links[assetType],
      async (link) => {
        if (assetType === "js") {
          options.page.data.jsLinks += `<script src="${link.path}"></script>`;
        }

        if (assetType === "css") {
          options.page.data.cssLinks += `<link href="${link.path}" rel="stylesheet">`;
        }
      }
    );
  },

  processLinksForProdMode: async function (options, assetType) {
    if (process.env.MODE !== "production") return;

    let fileContent = "";

    await globalService.asyncForEach(
      options.page.data.links[assetType],
      async (link) => {
        let root = link.path.startsWith("/node_modules");
        if (link.path.includes("/api/containers/css/download/template.css")) {
          link.path = "/storage/css/template.css";
        }
        let fileContentRaw = await fileService.getFile(link.path, root);
        console.log(
          `Adding Path: ${link.path} -- Size: ${fileContentRaw.length}`
        );
        fileContent += fileContentRaw + "\n";
        console.log(`fileContent Size: ${fileContent.length}`);
      }
    );

    let appVersion = globalService.getAppVersion();
    let fileName = this.getCombinedFileName(assetType);

    if (assetType === "js") {
      await this.createCombinedFile(fileContent, fileName, assetType);
    }
    if (assetType === "css") {
      await this.createCombinedFile(fileContent, fileName, assetType);
    }
  },

  createCombinedFile: async function (fileContent, fileName, assetType) {
    let path = this.getAssetPath(fileName);
    let minifiedAsset = "";
    if (!fileService.fileExists(path)) {
      console.log(`Generating Asset: ${path}`);
      if (assetType === "js") {
        minifiedAsset = UglifyJS.minify(fileContent, {
          compress: false,
        }).code;
      }
      if (assetType === "css") {
        minifiedAsset = csso.minify(fileContent).css;
      }

      fileService.writeFile(`../${path}`, minifiedAsset);
    }
  },

  getAssetPath: function (fileName) {
    return `/assets/${fileName.split(".").pop()}/${fileName}`;
  },

  getCombinedFileName: function (assetType) {
    let appVersion = globalService.getAppVersion();
    return `combined-${appVersion}.${assetType}`;
  },
};
