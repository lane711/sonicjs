const https = require("https");
fs = require('fs')
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var fileService = require("./file.service");
const archiver = require('archiver');


const token = process.env.DROPBOX_TOKEN

module.exports = backUpService = {

  startup: async function (app) {
    app.get("/backup", async function (req, res) {

      await backUpService.exportContentToJsonFiles();
      await backUpService.zipBackUpDirectory()
      backUpService.uploadToDropBox();
    });
  },

  exportContentToJsonFiles: async function(){
    let contents = await dalService.contentGet('','','','','','');

    contents.forEach(content => {
      fileService.writeFile(`backups/content/${content.id}.json`,JSON.stringify(content));
    });
  },

  zipBackUpDirectory: async function(){
    const output = fs.createWriteStream(__dirname + '/example.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.directory(`${appRoot.path}/backups/conten/`, false);

  },

  uploadToDropBox: async function (backupFileName) {
    fs.readFile(`${appRoot.path}/README.md`, 'utf8', function (err, data) {
      const req = https.request('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Dropbox-API-Arg': JSON.stringify({
            'path': '/backup/test.txt',
            'mode': 'overwrite',
            'autorename': true, 
            'mute': false,
            'strict_conflict': false
          }),
            'Content-Type': 'application/octet-stream',
        }
      }, (res) => {
        console.log("statusCode: ", res.statusCode);
          console.log("headers: ", res.headers);
    
          res.on('data', function(d) {
              process.stdout.write(d);
          });
      });
    
      req.write(data);
      req.end();
    });
  },

};
