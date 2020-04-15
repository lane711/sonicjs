var globalService = require("./global.service");
var eventBusService = require("./event-bus.service");
var fileService = require("./file.service");
var dataService = require("./data.service");
const path = require("path");
var UglifyJS = require("uglify-es");
var assetType = "";

module.exports = assetService = {
  startup: async function () {
    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options && options.page) {
        options.page.data.jsLinks = "";
        options.page.data.cssLinks = "";

        await assetService.getLinks(options, "js");
        await assetService.getLinks(options, "css");
      }
    });

    eventBusService.on("requestBegin", async function (options) {
      //handle combined js file
      if (process.env.MODE !== "production") return;

      if (
        options.req.url.startsWith("/js/combined-") ||
        options.req.url.startsWith("/css/combined-")
      ) {
        this.assetType = options.req.url.includes("/js/") ? "js" : "css";
        let appVersion = globalService.getAppVersion();
        let fileName = `combined-${appVersion}.${this.assetType}`;
        let file = path.join(
          __dirname,
          "..",
          `/assets/${this.assetType}/${fileName}`
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

  getLinks: async function (options, assetType) {
    this.assetType = assetType;
    options.page.data.links = {};
    options.page.data.links[this.assetType] = [];

    await this.getAssets(options);

    await this.processLinksForDevMode(options);

    await this.processLinksForProdMode(options);
  },

  getAssets: async function (options) {
    let paths = [];
    if (globalService.isBackEnd) {
      let assets = await dataService.getContentByContentTypeAndTitle(
        "asset",
        `${this.assetType}-back-end`
      );
      this.addPaths(options, assets.data.paths);
    }

    if (globalService.isFrontEnd) {
      let assets = await dataService.getContentByContentTypeAndTitle(
        "asset",
        `${this.assetType}-front-end`
      );
      this.addPaths(options, assets.data.paths);
    }

    //add module js files
    if (this.assetType === "js") {
      await globalService.asyncForEach(
        globalService.moduleJsFiles,
        async (path) => {
          this.addPath(options, { path: path });
        }
      );
    }

    //add module css files
    if (this.assetType === "css") {
      await globalService.asyncForEach(
        globalService.moduleCssFiles,
        async (path) => {
          this.addPath(options, { path: path });
        }
      );
    }
  },

  addPaths: function (options, paths) {
    paths.forEach((path) => {
      let skipAsset =
        path.pageBuilderOnly && !options.page.data.showPageBuilder;
      if (!skipAsset) {
        this.addPath(options, path);
      }
    });
  },

  addPath: function (options, path) {
    options.page.data.links[this.assetType].push(path);
  },

  processLinksForDevMode: async function (options) {
    if (process.env.MODE === "production") return;

    await globalService.asyncForEach(
      options.page.data.links[this.assetType],
      async (link) => {
        if (this.assetType === "js") {
          options.page.data.jsLinks += `<script src="${link.path}"></script>`;
        }

        if (this.assetType === "css") {
          options.page.data.cssLinks += `<link href="${link.path}" rel="stylesheet">`;
        }
      }
    );
  },

  processLinksForProdMode: async function (options) {
    if (process.env.MODE !== "production") return;

    var jsCode = "";

    await globalService.asyncForEach(
      options.page.data.links[this.assetType],
      async (link) => {
        let root = link.path.startsWith("/node_modules");
        let fileContent = await fileService.getFile(link.path, root);
        jsCode += fileContent + "\n";
      }
    );

    let appVersion = globalService.getAppVersion();
    let jsFileName = `combined-${appVersion}.js`;
    let cssFileName = `combined-${appVersion}.css`;

    await this.createCombinedJsFile(jsCode, jsFileName);

    let version = 1;
    options.page.data.jsLinks += `<script src="/js/${jsFileName}"></script>`;
    options.page.data.cssLinks += `<link href="/css/${cssFileName}" rel="stylesheet">`;
  },

  createCombinedJsFile: async function (jsCode, jsFileName) {
    let path = `/assets/js/${jsFileName}`;
    if (!fileService.fileExists(path)) {
      var minifiedJs = UglifyJS.minify(jsCode, {
        compress: false,
      });

      fileService.writeFile(`../assets/js/${jsFileName}`, minifiedJs.code);
    }
  },
};
