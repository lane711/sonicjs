var dataService = require("./data.service");
var helperService = require("./helper.service");
var eventBusService = require("./event-bus.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var path = require("path");

module.exports = fileService = {
  // startup: async function () {
  //     eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
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

  getFileSync: async function (filePath, root = false) {
    let adminPath = this.getFilePath(filePath, root);
    let content = fs.readFileSync(adminPath, "utf8");
    return content;
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

  writeFile: async function (filePath, fileContent) {
    let fullPath = path.join(__dirname, filePath);
    // console.log('adminPath--->', adminPath);

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
};
