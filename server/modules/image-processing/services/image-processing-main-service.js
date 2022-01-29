const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const jimp = require('jimp')
const path = require('path')
const fs = require('fs')

module.exports = imageProcessingMainService = {
  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'IMAGE-PROCESSING') {
        options.moduleName = 'image-processing'
        await moduleService.processModuleInColumn(options)
      }
    })

    emitterService.on('requestBegin', async function (options) {
      if (options.req.url.startsWith('/images/')) {
        const filePath = decodeURIComponent(options.req.path)

        if (!isSupportedImageType(filePath)) {
          return
        }

        options.req.isRequestAlreadyHandled = true

        // Read the image.
        const fileName = filePath.replace('/images/', '')
        const width =
          options.req.query.width === '0' ? undefined : options.req.query.width
        const height =
          options.req.query.height === '0'
            ? undefined
            : options.req.query.height

        if (!width && !height) {
          // send original image
          // should redirect
          options.res.redirect(`/api/containers/files/download/${fileName}`)
          return
        }

        const imagePath = path.join(
          __dirname,
          '../../..',
          `/storage/files/${fileName}`
        )
        let newImagePath = `server/storage/files/width-${width}/${fileName}`

        let widthBasedResize = true
        if (!width && height) {
          newImagePath = `server/storage/files/height-${height}/${fileName}`
          widthBasedResize = false
        }

        if (!width && !height) {
          const originalImagePath = `server/storage/files/${fileName}`
          options.res.sendFile(originalImagePath, { root: './' })
        }

        try {
          if (!fs.existsSync(newImagePath)) {
            // file does not exist
            console.log(
              `creating ${fileName} with width: ${width}, height: ${height} at: ${newImagePath}`
            )
            const image = await jimp.read(imagePath)
            image.quality(100)
            if (widthBasedResize) {
              await image.resize(parseInt(width), jimp.AUTO)
            } else {
              await image.resize(jimp.AUTO, parseInt(height))
            }
            const img = await image.writeAsync(newImagePath)
          }
        } catch (err) {
          console.error(err)
        }

        options.res.sendFile(newImagePath, { root: './' })
      }
    })

    function isSupportedImageType (filePath) {
      const extension = filePath.split('.').pop()
      const supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
      const isSupportedImageType = supportedImageTypes.includes(extension, 0)
      return isSupportedImageType
    }
  }
}
