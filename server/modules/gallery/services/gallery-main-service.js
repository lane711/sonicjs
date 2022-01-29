const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = galleryMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'GALLERY') {
        options.moduleName = 'gallery'
        await moduleService.processModuleInColumn(options)
      }
    })

    // emitterService.on("postModuleGetData", async function (options) {
    //     if (options.shortcode.name !== "GALLERY") {
    //       return;
    //     }

    //     // let mediaList = await dataService.getContentByContentTypeAndTag('media', options.viewModel.data.tags);
    //     // options.viewModel.data.mediaList = [{file:'testfile.png'}];

    //   });
  }

}
