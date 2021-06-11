const https = require("https");
fs = require("fs");
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var fileService = require("./file.service");
const archiver = require("archiver");

const token = process.env.DROPBOX_TOKEN;

module.exports = backUpService = {
  startup: async function (app) {
    app.get("/backup", async function (req, res) {
      await backUpService.exportContentToJsonFiles();
      // await backUpService.zipBackUpDirectory();
      // backUpService.uploadToDropBox();
      res.sendStatus(200);
    });
  },

  exportContentToJsonFiles: async function () {
    //content
    let contents = await dalService.contentGet("", "", "", "", "", "");

    contents.forEach((content) => {
      fileService.writeFile(
        `backups/content/${content.id}.json`,
        JSON.stringify(content)
      );
    });

    //user
    let users = await dalService.usersGet();

    users.forEach((user) => {
      fileService.writeFile(
        `backups/user/${user.id}.json`,
        JSON.stringify(user)
      );
    });

    //tags

  },

  zipBackUpDirectory: async function () {
    // return new Promise(function(resolve, reject) {
      const zipPath = `${appRoot.path}/backups/content.zip`;
      var output = fs.createWriteStream(zipPath);
      var archive = archiver('zip', {
        zlib: { level: 9 },
      });
  
      archive.on('error', function(err) {
        console.log(err);
      });
  
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          console.log('Archiver warning: ', err);
        } else {
          console.log(err);
        }
      });
  
      archive.pipe(output);
      archive.glob('**/*.json', { cwd: `${appRoot.path}/backups/content/` });
      archive.finalize();
  
      output.on('close', function() {
        console.log(zipPath);
      });
    // });

    return;

  },

  uploadToDropBox: async function (backupFileName) {
    fs.readFile(`${appRoot.path}/README.md`, "utf8", function (err, data) {
      const req = https.request(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Dropbox-API-Arg": JSON.stringify({
              path: "/backup/test.txt",
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
