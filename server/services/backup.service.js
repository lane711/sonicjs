const https = require('https')
fs = require('fs')
const appRoot = require('app-root-path')
const dalService = require('./dal.service')
const fileService = require('./file.service')
const archiver = require('archiver')

const token = process.env.DROPBOX_TOKEN
const backUpUrl = process.env.BACKUP_URL

module.exports = backUpService = {
  startup: async function (app) {
    app.get(backUpUrl, async function (req, res) {
      await backUpService.exportContentToJsonFiles()
      // await backUpService.zipBackUpDirectory();
      // backUpService.uploadToDropBox();
      res.redirect('/admin/backup-restore')
    })
  },

  exportContentToJsonFiles: async function () {
    backUpService.cleanupTempFiles()
    // content
    const contents = await dalService.contentGet('', '', '', '', '', '', '', false, true)

    contents.forEach((content) => {
      fileService.writeFile(
        `backups/temp/backup/content/${content.id}.json`,
        JSON.stringify(content)
      )
    })

    // backUpService.zipBackUpDirectory('content');

    // user
    const users = await dalService.usersGet('', '', true)

    users.forEach((user) => {
      fileService.writeFile(
        `backups/temp/backup/user/${user.id}.json`,
        JSON.stringify(user)
      )
    })

    // backUpService.zipBackUpDirectory('user');
    const fileName = `${new Date().toJSON()}-sonicjs-backup.zip`
    backUpService.zipJsonFilesDirectory(fileName)
  },

  cleanupTempFiles: async function () {
    // empty temp files
    fileService.deleteFilesInDirectory(`${appRoot.path}/backups/temp/backup/content`)
    fileService.deleteFilesInDirectory(`${appRoot.path}/backups/temp/backup/user`)
  },

  zipJsonFilesDirectory: async function (fileName) {
    // return new Promise(function(resolve, reject) {
    const zipPath = `${appRoot.path}/backups/${fileName}`
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    archive.on('error', function (err) {
      console.log(err)
    })

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.log('Archiver warning: ', err)
      } else {
        console.log(err)
      }
    })

    archive.pipe(output)
    archive.glob('**/*.json', { cwd: `${appRoot.path}/backups/temp/backup` })
    archive.finalize()

    output.on('close', function () {
      console.log('backup completed: ' + zipPath)
      backUpService.cleanupTempFiles()
    })
  },

  uploadToDropBox: async function (sourceFilePath, destinationFileName) {
    fs.readFile(sourceFilePath, 'utf8', function (err, data) {
      const req = https.request(
        'https://content.dropboxapi.com/2/files/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Dropbox-API-Arg': JSON.stringify({
              path: destinationFileName,
              mode: 'overwrite',
              autorename: true,
              mute: false,
              strict_conflict: false
            }),
            'Content-Type': 'application/octet-stream'
          }
        },
        (res) => {
          console.log('statusCode: ', res.statusCode)
          console.log('headers: ', res.headers)

          res.on('data', function (d) {
            process.stdout.write(d)
          })
        }
      )

      req.write(data)
      req.end()
    })
  }
}
