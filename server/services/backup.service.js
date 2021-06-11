const https = require("https");
fs = require('fs')
var appRoot = require("app-root-path");

const token = process.env.DROPBOX_TOKEN

module.exports = backUpService = {

  startup: async function (app) {
    app.get("/backup", async function (req, res) {

      backUpService.uploadToDropBox();
    });
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
