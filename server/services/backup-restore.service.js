const https = require("https");
fs = require("fs");
var unzipper = require("unzipper");
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var dataService = require("./data.service");
var fileService = require("./file.service");
const archiver = require("archiver");
const {v4: uuidv4} = require('uuid');

const token = process.env.DROPBOX_TOKEN;
const backUpRestoreUrl = process.env.BACKUP_RESTORE_URL;

module.exports = backUpRestoreService = {
  startup: async function (app) {
    if (backUpRestoreUrl) {
      app.get(backUpRestoreUrl, async function (req, res) {
        const backupFilePath = `${appRoot.path}${req.query.file}`;
        await backUpRestoreService.importJsonFiles(req, backupFilePath);
        // await backUpRestoreService.zipBackUpDirectory();
        // backUpRestoreService.uploadToDropBox();
        res.redirect(`/admin/backup-restore`);
      });
    }
  },

  importJsonFiles: async function (req, backupFilePath) {
    console.log("starting restore");
    //unzip into json files

    fileService.deleteFilesInDirectory(
      `${appRoot.path}/backups/temp/restore/user`
    );
    fileService.deleteFilesInDirectory(
      `${appRoot.path}/backups/temp/restore/content`
    );

    const extractToPath = `${appRoot.path}/backups/temp/restore`;

    fs.createReadStream(backupFilePath)
      .pipe(unzipper.Extract({path: extractToPath}))
      .on("entry", (entry) => entry.autodrain())
      .promise()
      .then(
        () => {
          console.log("done");
          backUpRestoreService.processJsonFiles(req);
        },
        (e) => console.log("error", e)
      );
  },

  processJsonFiles: async function (req) {
    var contentFiles = fileService.getFilesSync(
      "/backups/temp/restore/content"
    );

    console.log("file count:" + contentFiles.length);
    if (contentFiles.length) {
      await dalService.contentDeleteAll(req);
    }
    for (let index = 0; index < contentFiles.length; index++) {
      const file = contentFiles[index];
      console.log("file:" + file);

      if (file.includes(".json")) {
        // let file = '479.json';
        let contentFile = fileService.getFileSync(
          `/backups/temp/restore/content/${file}`
        );

        if (contentFile) {
          let payload = JSON.parse(contentFile);
          try {
            if (payload.createdByUserId == 0) {
              payload.createdByUserId = uuidv4();
            }
            if (payload.lastUpdatedByUserId == 0) {
              payload.lastUpdatedByUserId = uuidv4();
            }

            await dalService.contentRestore(payload, req.sessionID);
          } catch (error) {
            console.log("id", id);

            console.log(error);
            console.log("paylaod", payload);
          }
        }
      }
    }
  },

};
