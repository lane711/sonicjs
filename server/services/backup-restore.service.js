const https = require("https");
fs = require("fs");
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var dataService = require("./data.service");
var fileService = require("./file.service");
const archiver = require("archiver");

const token = process.env.DROPBOX_TOKEN;
const backUpRestoreUrl = process.env.BACKUP_RESTORE_URL;

module.exports = backUpRestoreService = {
  startup: async function (app) {
    if (backUpRestoreUrl) {
      app.get(backUpRestoreUrl, async function (req, res) {
        await backUpRestoreService.importJsonFiles(req);
        // await backUpRestoreService.zipBackUpDirectory();
        // backUpRestoreService.uploadToDropBox();
        res.sendStatus(200);
      });
    }
  },

  importJsonFiles: async function (req) {
    console.log('starting restore');

    var contentFiles = fileService.getFilesSync("/backups/content");
    for (let index = 0; index < contentFiles.length; index++) {
      const file = contentFiles[index];
      console.log('file:' + file);

      // let file = '479.json';

      let contentFile = fileService.getFileSync(`/backups/content/${file}`);

      if (contentFile) {
        let payload = JSON.parse(contentFile);
        let id = parseInt(file.replace(".json", ""));
        payload.id = id;
        try {
          await dalService.contentRestore(
            id,
            payload.url,
            payload,
            req.sessionID
          );
        } catch (error) {
          console.log("id", id);

          console.log(error);
          console.log("paylaod", payload);
        }
      }
    }

    // var userFiles = fileService.getFilesSync("/backups/user");

    // for (let index = 0; index < userFiles.length; index++) {
    //   const file = userFiles[index];
    //   let userFile = fileService.getFileSync(`/backups/user/${file}`);
    //   if (userFile) {
    //     let payload = JSON.parse(userFile);
    //     let id = parseInt(file.replace('.json', ''));
    //     payload.id = id;
    //     await dalService.userRestore(id, payload.url, payload, req.sessionID);
    //   }
    // }
  },
};
