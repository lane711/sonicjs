const dataService = require('./data.service')
const helperService = require('./helper.service')
const emitterService = require('./emitter.service')

const fs = require('fs')
const axios = require('axios')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree
const chalk = require('chalk')
const log = console.log

module.exports = siteSettingsService = {

  startup: async function () {
    emitterService.on('getRenderedPagePostDataFetch', async function (options) {
      if (options) {
        await siteSettingsService.processSiteSettings(options.page, options.req.sessionID)
      }
    })
  },

  processSiteSettings: async function (page, sessionID) {
    const siteSettings = await dataService.getContentTopOne('site-settings', sessionID)
    page.data.siteSettings = siteSettings.data
  }
}
