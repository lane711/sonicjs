var globalService = require("./global.service");
var emitterService = require("./emitter.service");
var fileService = require("./file.service");
var dataService = require("./data.service");
const path = require("path");
var UglifyJS = require("uglify-js");
var csso = require("csso");
var fileName = {};
const frontEndTheme = `${process.env.FRONT_END_THEME}`;
const frontEndThemeBootswatch = `${process.env.FRONT_END_THEME_BOOTSWATCH}`;
const adminTheme = `${process.env.ADMIN_THEME}`;

module.exports = assetService = {
  startup: async function () {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options && options.page) {
        options.page.data.jsLinks = "";
        options.page.data.cssLinks = "";

        if (process.env.MODE === "production") {
          //TODO: cache this
          let assetFilesExist = await assetService.doesAssetFilesExist();

          // if (process.env.REBUILD_ASSETS === "TRUE" || !assetFilesExist || options.req.pageLoadedCount === 1) {
          if (!assetFilesExist || options.req.pageLoadedCount === 1) {
            //rebuild the assets before delivering
            await assetService.getLinks(options, "css");
            await assetService.getLinks(options, "js");

            //file will now exist, so no need to rebuild
            // await fileService.updateEnvFileVariable("REBUILD_ASSETS", "FALSE");
          }

          //add combined assets
          options.page.data.jsLinks = `<script src="/assets/js/${assetService.getCombinedFileName(
            "js"
          )}"></script>`;
          options.page.data.cssLinks = `<link href="/assets/css/${assetService.getCombinedFileName(
            "css"
          )}" rel="stylesheet">`;
        } else {
          // await fileService.updateEnvFileVariable("REBUILD_ASSETS", "TRUE");
          await assetService.getLinks(options, "css");
          await assetService.getLinks(options, "js");
        }
      }
    });

    emitterService.on("requestBegin", async function (options) {
      //handle combined js file
      if (process.env.MODE !== "production") return;

      if (
        options.req.url.startsWith("/assets/js/combined-") ||
        options.req.url.startsWith("/assets/css/combined-")
      ) {
        let assetType = options.req.url.includes("/js/") ? "js" : "css";
        let appVersion = globalService.getAppVersion();
        let fileName = assetService.getCombinedFileName(assetType);

        console.log('prod asset', assetType, appVersion, fileName);

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

  doesAssetFilesExist: async function () {
    // console.log('doesAssetFilesExist', fileName);
    let cssPath = this.getAssetPath(this.getCombinedFileName("css"));
    let jsPath = this.getAssetPath(this.getCombinedFileName("js"));
    return fileService.fileExists(cssPath) && fileService.fileExists(jsPath);
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
        `${assetType}-back-end`,
        option.req.sessionID
      );
      let asset2 = this.getThemeAssets();
      this.addPaths(options, assets.data.paths, assetType);
    }

    if (globalService.isFrontEnd) {

      let assets = await this.getThemeAssets();

      this.addPaths(options, assets[assetType], assetType);

      // add css for current theme
      if (assetType === "css") {
        if (frontEndThemeBootswatch && frontEndThemeBootswatch !== undefined) {
          this.addPath(
            options,
            {
              path: `/node_modules/bootswatch/dist/${frontEndThemeBootswatch}/bootstrap.min.css`,
            },
            assetType
          );
        }
      }
    }

    //add module js files
    if (assetType === "js") {
      await globalService.asyncForEach(
        globalService.moduleJsFiles,
        async (path) => {
          this.addPath(options, {path: path}, assetType);
        }
      );
    }

    //add module css files
    if (assetType === "css") {
      await globalService.asyncForEach(
        globalService.moduleCssFiles,
        async (path) => {
          this.addPath(options, {path: path}, assetType);
        }
      );
    }
  },

  getThemeAssets: async function () {
    var themeConfig = await fileService.getYamlConfig(
      `/server/themes/front-end/${frontEndTheme}/${frontEndTheme}.config.yml`
    );
    return themeConfig.assets;
  },

  addPaths: function (options, paths, assetType) {
    paths.forEach((path) => {
      let typeOfRecord = typeof path;
      if (typeOfRecord === "object") {
        path = Object.keys(path)[0];
      }
      let skipAsset =
        typeOfRecord === "object" && !options.page.data.showPageBuilder;
      if (!skipAsset) {
        this.addPath(options, {path: path}, assetType);
      }
    });
  },

  addPath: function (options, path, assetType) {
    this.processPathForVariables(path);
    try {
      options.page.data.links[assetType].push(path);
    } catch (error) {
      console.log(error);
    }
  },

  processPathForVariables: function (path) {
    path.path = path.path.replace("{{frontEndTheme}}", frontEndTheme);
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
          link.path = `/server/themes/front-end/${frontEndTheme}/css/template-processed.css`;
        }
        if (!link.path.startsWith('/node_modules')) {
          link.path = '/server' + link.path;
        }
        let fileContentRaw = await fileService.getFile(link.path);
        if (fileContentRaw) {
          console.log(
            `Adding Path: ${link.path} -- Size: ${fileContentRaw.length}`
          );
          fileContent += fileContentRaw + "\n";
          console.log(`fileContent Size: ${fileContent.length}`);
        } else {
          console.log("empty, skipping:  " + link.path);
        }
      }
    );


    let appVersion = globalService.getAppVersion();
    let fileName = this.getCombinedFileName(assetType);
    let overwriteFile = options.req.pageLoadedCount === 1;

    await this.createCombinedFile(fileContent, fileName, assetType, overwriteFile);
  },

  createCombinedFile: async function (fileContent, fileName, assetType, overwriteFile) {
    let path = this.getAssetPath(fileName);
    let minifiedAsset = "";
    if (!fileService.fileExists(path) || overwriteFile) {
      console.log(`Generating Asset: ${path}`);
      if (assetType === "js") {
        let minJs = UglifyJS.minify(fileContent, {
          compress: false,
        });

        if (minJs.error) {
          console.error(`Error minifying ${fileName}`, minJs.error)
        }

        minifiedAsset = minJs.code;
      }

      if (assetType === "css") {
        let cssMin = csso.minify(fileContent).css;
        minifiedAsset = cssMin;

      }

      fileService.writeFile(`${path}`, minifiedAsset);
    }
  },

  getAssetPath: function (fileName) {
    return `/server/assets/${fileName.split(".").pop()}/${fileName}`;
  },

  getCombinedFileName: function (assetType) {
    let appVersion = globalService.getAppVersion();
    return `combined-${appVersion}.${assetType}`;
  },
};
