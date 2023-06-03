/**
 * Backup Service -
 * The backup service is responsible for backing up all database data into json files (one for each db record) and then zipping them up.
 * @module backupService
 */
const https = require("https");
fs = require("fs");
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var fileService = require("./file.service");
const archiver = require("archiver");
const moment = require("moment");
const connectEnsureLogin = require("connect-ensure-login");
var appRoot = require("app-root-path");
const {resolve} = require('path');

const token = process.env.DROPBOX_TOKEN;
const backUpUrl = process.env.BACKUP_URL;

module.exports = backUpService = {
  startup: async function (app) {
    app.get(backUpUrl, async function (req, res) {
      await backUpService.exportContentToJsonFiles();
      // await backUpService.zipBackUpDirectory();
      // backUpService.uploadToDropBox();
      res.redirect('/admin/backup-restore');
    });

    app.get('/backups/*', connectEnsureLogin.ensureLoggedIn(), async function (req, res) {

      const file = `${appRoot.path}/${req.path}`;

      const path = resolve(file)

      if (!path.includes(`${appRoot.path}/backups`)) {
         console.log("Directory traversal detected...")
         res.redirect('/admin/backup-restore');
         return;
      }

      console.log(`downloading backup ${file}`)
      
      res.download(file);
    });
  },

  exportContentToJsonFiles: async function () {
    await backUpService.cleanupTempFiles();
    //content
    let contents = await dalService.contentGet("", "", "", "", "", "", "", "", false, true);

    contents.map((content) => {
      fileService.writeFile(
        `/backups/temp/backup/content/${content.id}.json`,
        JSON.stringify(content)
      );
    });

    // backUpService.zipBackUpDirectory('content');

    //user
    let users = await dalService.usersGet("", "", true);

    users.map((user) => {
      fileService.writeFile(
        `/backups/temp/backup/user/${user.id}.json`,
        JSON.stringify(user)
      );
    });

    let dateString = moment().format('YY-MM-DD_h.mm.ssa')
    let fileName = `${dateString}-sonicjs-backup.zip`;
    backUpService.zipJsonFilesDirectory(fileName);
  },

  cleanupTempFiles: async function () {
    //empty temp files
    fileService.deleteFilesInDirectory(`${appRoot.path}/backups/temp/backup/content`);
    fileService.deleteFilesInDirectory(`${appRoot.path}/backups/temp/backup/user`);
  },

  zipJsonFilesDirectory: async function (fileName) {
    // return new Promise(function(resolve, reject) {
    const zipPath = `${appRoot.path}/backups/${fileName}`;
    var output = fs.createWriteStream(zipPath);
    var archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", function (err) {
      console.log(err);
    });

    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.log("Archiver warning: ", err);
      } else {
        console.log(err);
      }
    });

    archive.pipe(output);
    archive.glob("**/*.json", { cwd: `${appRoot.path}/backups/temp/backup` });
    archive.finalize();

    output.on("close", function () {
      console.log("backup completed: " + zipPath);
      backUpService.cleanupTempFiles();
    });

  },

  uploadToDropBox: async function (sourceFilePath, destinationFileName) {
    fs.readFile(sourceFilePath, "utf8", function (err, data) {
      const req = https.request(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Dropbox-API-Arg": JSON.stringify({
              path: destinationFileName,
              mode: "overwrite",
              autorename: true,
              mute: false,
              strict_conflict: false,
            }),
            "Content-Type": "application/octet-stream",
          },
        },
        (res) => {
          console.log("statusCode: ", res.statusCode);
          console.log("headers: ", res.headers);

          res.on("data", function (d) {
            process.stdout.write(d);
          });
        }
      );

      req.write(data);
      req.end();
    });
  },
};
