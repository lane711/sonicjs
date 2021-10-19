var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");
var s3Service = require("./s3.service");

var fs = require("fs");
var fsPromise = require("fs").promises;
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var path = require("path");
const YAML = require("yaml");
const { parse, stringify } = require("envfile");
var appRoot = require("app-root-path");
const glob = require("glob");

module.exports = fileService = {
  // startup: async function () {
  //     emitterService.on('getRenderedPagePostDataFetch', async function (options) {
  //         if (options) {
  //             await mediaService.processHeroImage(options.page);
  //         }
  //     });
  // },

  getFile: async function (relativeFilePath) {
    let filePath = path.join(appRoot.path, relativeFilePath);

    if (filePath.includes("/server/sonicjs-services/")) {
      filePath = filePath.replace("/server/sonicjs-services/", "/server/services/");
    }

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.log(chalk.red(err));
          reject(err);
        } else resolve(data);
      });
    });
  },

  getFileSync: function (relativeFilePath) {
    if (!relativeFilePath.includes(".gitignore")) {
      let filePath = path.join(appRoot.path, relativeFilePath);

      // console.log('getFileSync filePath: ', filePath);

      let content = fs.readFileSync(filePath, "utf8");
      return content;
    }
  },

  getFilesSync: function (relativeDir) {
    let files = fs.readdirSync(path.join(appRoot.path + relativeDir));
    return files;
  },

  getFilesSearchSync: function (dir, pattern) {
    const files = glob.sync(path.join(dir + pattern));
    let filesRelative = fileService.convertFullPathToRelative(files);
    return filesRelative;
  },

  convertFullPathToRelative: function (files) {
    let filesRelative = [];

    files.forEach((file) => {
      const root = appRoot.path.split(path.sep).join(path.posix.sep);
      filesRelative.push(file.replace(root, ""));
    });

    return filesRelative;
  },

  getFilePath: function (filePath, root = false) {
    let adminPath = "";
    if (root) {
      adminPath = path.join(__dirname, "../../", filePath);
    } else {
      adminPath = path.join(__dirname, "../", filePath);
    }
    return adminPath;
  },

  getYamlConfig: async function (path) {
    let yamlFile = await this.getFile(path);
    let parsedFile = YAML.parse(yamlFile);
    return parsedFile;
  },

  writeFile: async function (filePath, fileContent) {
    let fullPath = path.join(this.getRootAppPath(), filePath);
    await fsPromise.writeFile(fullPath, fileContent);
  },

  uploadWriteFile: async function (file, sessionID) {
    let storageOption = process.env.FILE_STORAGE;
    if (
      storageOption === "AMAZON_S3" &&
      file.name.match(/.(jpg|jpeg|png|gif|svg)$/i)
    ) {
      var title = file.name.replace(/^.*[\\\/]/, "");
      let result = await s3Service.upload(
        file.name,
        file.path,
        "image",
        file.type
      );

      //see if image already exists
      let existingMedia = await dataService.getContentByContentTypeAndTitle(
        "media",
        title
      );

      if (!existingMedia) {
        //create media record
        let payload = {
          data: {
            title: title,
            file: file.name,
            contentType: "media",
          },
        };
        // debugger;
        await dataService.contentCreate(payload, true, sessionID);
      }
      // await createInstance(payload);
      //delete temp file?
    }
  },

  createDirectory: async function (directoryRelativePath) {
    let dirPath = path.join(appRoot.path, directoryRelativePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  },

  fileExists: function (filePath) {
    let dirPath = path.join(appRoot.path, filePath);
    let fileExist = fs.existsSync(dirPath);
    return fileExist;
  },

  getRootAppPath: function () {
    return appRoot.path;
  },

  //this causes all env comments to be lost
  // updateEnvFileVariable: async function (variableName, variableValue) {
  //   process.env.REBUILD_ASSETS = "FALSE";

  //   let envFile = await this.getFile(".env");
  //   let parsedFile = parse(envFile);
  //   parsedFile[variableName] = variableValue;
  //   let envFileContent = stringify(parsedFile);
  //   await this.writeFile(".env", envFileContent);
  // },

  deleteFile: function (filePath) {
    fs.unlinkSync(filePath);
  },

  deleteDirectory: function (directoryPath) {
    return fs.rmdirSync(directoryPath, { recursive: true });
  },
};
