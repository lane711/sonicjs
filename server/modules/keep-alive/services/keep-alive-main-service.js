const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const viewService = require('../../../services/view.service')
const https = require('https')

module.exports = keepAliveMainService = {

  startup: async function () {
    emitterService.on('modulesLoaded', async function () {
      setInterval(function () {
        https.get('https://sonicjs.herokuapp.com/')
        // console.log('keep alive' + globalService.getBaseUrl());
      }, 300000) // every 5 minutes (300000)
    })
  }

  // processView: async function (contentType, viewModel, viewPath) {
  //     var result = await viewService.getProcessedView(contentType, viewModel, viewPath);

  //     return result;
  // }

}
