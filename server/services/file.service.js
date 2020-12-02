var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var path = require("path");
const YAML = require("yaml");
const { parse, stringify } = require("envfile");
var appRoot = require('app-root-path');
const glob = require('glob');


module.exports = fileService = {
  // startup: async function () {
  //     emitterService.on('getRenderedPagePostDataFetch', async function (options) {
  //         if (options) {
  //             await mediaService.processHeroImage(options.page);
  //         }
  //     });
  // },

  getFile: async function (filePath, root = false) {
    let adminPath = this.getFilePath(filePath, root);

    return new Promise((resolve, reject) => {
      fs.readFile(adminPath, "utf8", (err, data) => {
        if (err) {
          console.log(chalk.red(err));
          reject(err);
        } else resolve(data);
      });
    });
  },

  getFileSync: function (filePath, root = false, systemRoot = false) {
    let adminPath = "";
    if (systemRoot) {
      adminPath = filePath;
    } else {
      adminPath = this.getFilePath(filePath, root);
    }
    let content = fs.readFileSync(adminPath, "utf8");
    return content;
  },

  getFilesSearchSync: function (dir, pattern){
    const files = glob.sync(path.join(dir + pattern));
    return files;

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

    return new Promise((resolve, reject) => {
      fs.writeFile(fullPath, fileContent, (err, data) => {
        if (err) {
          console.log(chalk.red(err));
          reject(err);
        } else resolve(data);
      });
    });
  },

  createDirectory: async function (directoryRelativePath) {
    let dirPath = path.join(__dirname, directoryRelativePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  },

  fileExists: function (filePath) {
    let dirPath = path.join(__dirname.replace("services", ""), filePath);
    let fileExist = fs.existsSync(dirPath);
    return fileExist;
  },

  getRootAppPath: function () {
    return appRoot.path;
  },

  updateEnvFileVariable: async function (variableName, variableValue) {
    process.env.REBUILD_ASSETS = "FALSE";

    let envFile = await this.getFile(".env", true);
    let parsedFile = parse(envFile);
    parsedFile[variableName] = variableValue;
    let envFileContent = stringify(parsedFile);
    await this.writeFile("../../.env", envFileContent);
  },

  deleteFile: function (filePath) {
    fs.unlinkSync(filePath);
  },
};
