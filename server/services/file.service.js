const dataService = require('./data.service')
const helperService = require('./helper.service')
const emitterService = require('./emitter.service')
const s3Service = require('./s3.service')

const fs = require('fs')
const fsPromise = require('fs').promises
const axios = require('axios')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree
const chalk = require('chalk')
const log = console.log
const path = require('path')
const YAML = require('yaml')
const { parse, stringify } = require('envfile')
const appRoot = require('app-root-path')
const glob = require('glob')

module.exports = fileService = {
  // startup: async function () {
  //     emitterService.on('getRenderedPagePostDataFetch', async function (options) {
  //         if (options) {
  //             await mediaService.processHeroImage(options.page);
  //         }
  //     });
  // },

  getFile: async function (relativeFilePath) {
    let filePath = path.join(appRoot.path, relativeFilePath)

    if (filePath.includes('/server/sonicjs-services/')) {
      filePath = filePath.replace(
        '/server/sonicjs-services/',
        '/server/services/'
      )
    }

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.log(chalk.red(err))
          reject(err)
        } else resolve(data)
      })
    })
  },

  getFileSync: function (relativeFilePath) {
    if (!relativeFilePath.includes('.gitignore')) {
      const filePath = path.join(appRoot.path, relativeFilePath)

      // console.log('getFileSync filePath: ', filePath);

      const content = fs.readFileSync(filePath, 'utf8')
      return content
    }
  },

  getFilesSync: function (relativeDir) {
    const files = fs.readdirSync(path.join(appRoot.path + relativeDir))
    return files
  },

  getFilesSearchSync: function (dir, pattern) {
    const files = glob.sync(path.join(dir + pattern))
    const filesRelative = fileService.convertFullPathToRelative(files)
    return filesRelative
  },

  convertFullPathToRelative: function (files) {
    const filesRelative = []

    files.forEach((file) => {
      const root = appRoot.path.split(path.sep).join(path.posix.sep)
      filesRelative.push(file.replace(root, ''))
    })

    return filesRelative
  },

  getFilePath: function (filePath, root = false) {
    let adminPath = ''
    if (root) {
      adminPath = path.join(__dirname, '../../', filePath)
    } else {
      adminPath = path.join(__dirname, '../', filePath)
    }
    return adminPath
  },

  getYamlConfig: async function (path) {
    const yamlFile = await this.getFile(path)
    const parsedFile = YAML.parse(yamlFile)
    return parsedFile
  },

  writeFile: async function (filePath, fileContent) {
    const fullPath = path.join(this.getRootAppPath(), filePath)
    await fsPromise.writeFile(fullPath, fileContent)
  },

  uploadWriteFile: async function (file, sessionID) {
    const storageOption = process.env.FILE_STORAGE
    if (
      storageOption === 'AMAZON_S3' &&
      file.name.match(/.(jpg|jpeg|png|gif|svg)$/i)
    ) {
      const title = file.name.replace(/^.*[\\\/]/, '')
      const result = await s3Service.upload(
        file.name,
        file.path,
        'image',
        file.type
      )

      // see if image already exists
      const existingMedia = await dataService.getContentByContentTypeAndTitle(
        'media',
        title
      )

      if (!existingMedia) {
        // create media record
        const payload = {
          data: {
            title: title,
            file: file.name,
            contentType: 'media'
          }
        }
        // debugger;
        await dataService.contentCreate(payload, true, sessionID)
      }
      // await createInstance(payload);
      // delete temp file?
    }
  },

  createDirectory: async function (directoryRelativePath) {
    const dirPath = path.join(appRoot.path, directoryRelativePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  },

  fileExists: function (filePath) {
    const dirPath = path.join(appRoot.path, filePath)
    const fileExist = fs.existsSync(dirPath)
    return fileExist
  },

  getRootAppPath: function () {
    return appRoot.path
  },

  // this causes all env comments to be lost
  // updateEnvFileVariable: async function (variableName, variableValue) {
  //   process.env.REBUILD_ASSETS = "FALSE";

  //   let envFile = await this.getFile(".env");
  //   let parsedFile = parse(envFile);
  //   parsedFile[variableName] = variableValue;
  //   let envFileContent = stringify(parsedFile);
  //   await this.writeFile(".env", envFileContent);
  // },

  deleteFile: function (filePath) {
    fs.unlinkSync(filePath)
  },

  deleteFilesInDirectory: function (directory) {
    fs.readdir(directory, (err, files) => {
      if (err) throw err

      for (const file of files) {
        if (!file.includes('.gitignore')) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err
          })
        }
      }
    })
  },

  deleteDirectory: function (directoryPath) {
    return fs.rmdirSync(directoryPath, { recursive: true })
  }
}
