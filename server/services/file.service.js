var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

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
    let filePath = path.join(appRoot.path, relativeFilePath);

    let content = fs.readFileSync(filePath, "utf8");
    return content;
  },

  getFilesSync: function (relativeDir) {
    let files = fs.readdirSync(path.join(appRoot.path + relativeDir));
    // let filesRelative = fileService.convertFullPathToRelative(files);
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
      filesRelative.push(file.replace(appRoot.path, ""));
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
    // console.log('fullPath--->', fullPath);

    await fsPromise.writeFile(fullPath, fileContent);
  },

  createDirectory: async function (directoryRelativePath) {
    let dirPath = path.join(appRoot.path, directoryRelativePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  },

  fileExists: function (filePath) {
    console.log('--> fileExists', filePath);
    let dirPath = path.join(appRoot.path, filePath);
    let fileExist = fs.existsSync(dirPath);
    return fileExist;
  },

  getRootAppPath: function () {
    return appRoot.path;
  },

  updateEnvFileVariable: async function (variableName, variableValue) {
    process.env.REBUILD_ASSETS = "FALSE";

    let envFile = await this.getFile(".env");
    let parsedFile = parse(envFile);
    parsedFile[variableName] = variableValue;
    let envFileContent = stringify(parsedFile);
    await this.writeFile("../../.env", envFileContent);
  },

  deleteFile: function (filePath) {
    fs.unlinkSync(filePath);
  },

  deleteDirectory: function (directoryPath) {
    return fs.rmdirSync(directoryPath, { recursive: true });
  },
};
