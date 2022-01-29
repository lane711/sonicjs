const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

const axios = require('axios')
let axiosInstance

module.exports = appAnalyticsMainService = {
  startup: async function (app) {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'APP-ANALYTICS') {
        options.moduleName = 'app-analytics'
        await moduleService.processModuleInColumn(options)
      }
    })

    emitterService.on('postPageRender', async function (options) {
      appAnalyticsMainService.trackEventSend({
        eventName: 'page_load',
        url: options.page.data.url
      })
    })

    emitterService.on('postAdminPageRender', async function (options) {
      appAnalyticsMainService.trackEventSend({
        eventName: 'admin_page_load',
        url: options.req.url
      })
    })

    emitterService.on('firstPageLoaded', async function (options) {
      const pageCount = await dataService.getContentByType('page', 0)
      appAnalyticsMainService.trackEventSend({
        eventName: 'startup',
        pageCount: pageCount.length
      })
    })

    if (process.env.ANALYTICS_RECEIVE_URL) {
      if (app) {
        app.post(process.env.ANALYTICS_RECEIVE_URL, async function (req, res) {
          appAnalyticsMainService.processEvent(req.body, req.ip)
          res.json({ ok: 'ok' })
        })
      }
    }
  },

  trackEventSend: async function (data) {
    if (await appAnalyticsMainService.trackingEnabled()) {
      const installFile = await appAnalyticsMainService.getEventMeta()

      data.installId = installFile.installId
      data.websiteTitle = installFile.websiteTitle
        ? installFile.websiteTitle
        : ''
      data.agreeToFeedback = installFile.agreeToFeedback
        ? installFile.agreeToFeedback
        : ''
      data.email = installFile.agreeToFeedback ? installFile.email : ''

      const axios = await appAnalyticsMainService.getAxios()
      const url = process.env.ANALYTICS_POST_URL
        ? process.env.ANALYTICS_POST_URL
        : 'https://sonicjs.com/sonicjs-app-analytics'
      const result = axios.post(url, data)
    }
  },

  getEventMeta: async function () {
    const installFile = require('../../../data/config/installId.json')
    return installFile
  },

  getLocation: async function (ipAddress) {
    const token = process.env.IPINFO_TOKEN
    const result = await axios.get(`https://ipinfo.io/${ipAddress}?token=${token}`)
    return result.data
  },

  processEvent: async function (data, ipAddress) {
    const profileUrl = `/analytics/${data.installId}`
    let profile = await dataService.getContentByUrl(profileUrl)
    const timeStamp = new Date().toISOString()

    if (!profile || profile.data.status === 'Not Found') {
      const payload = {
        data: {
          contentType: 'app-analytics',
          title: 'app-analytics',
          url: profileUrl,
          installId: data.installId,
          firstSeenOn: timeStamp,
          events: [],
          pageCount: 0,
          pageVisits: 0,
          adminPageVisits: 0,
          bootCount: 1
        }
      }
      payload.location = await appAnalyticsMainService.getLocation(ipAddress)
      profile = await dataService.contentCreate(payload, false, 0)
    }

    if (profile && profile.data && profile.data.events) {
      if (data.eventName == 'startup') {
        // only on startup get page counts, boot counts, etc
        profile.data.pageCount = data.pageCount
        // TODO

        // IP Lookup

        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp
        })
      }

      if (data.eventName === 'page_load') {
        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp,
          url: data.url
        })

        profile.data.pageVisits += 1
      }

      if (data.eventName === 'admin_page_load') {
        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp,
          url: data.url
        })

        profile.data.adminPageVisits += 1
      }

      profile.data.websiteTitle = data.websiteTitle
      profile.data.emailOptin = data.agreeToFeedback
      profile.data.email = data.email
      profile.data.lastSeenOn = timeStamp

      profile = await dataService.editInstance(profile, 0)
    }
  },

  getEmail: async function (req) {
    if (req.user && req.user.username) {
      return req.user.username
    }
  },

  trackingEnabled: async function (host) {
    if (
      process.env.LOCAL_ANALYTICS &&
      process.env.LOCAL_ANALYTICS.toLowerCase() === 'false'
    ) {
      return false
    }

    if (
      process.env.LOCAL_ANALYTICS &&
      process.env.LOCAL_ANALYTICS.toLowerCase() === 'true'
    ) {
      return true
    }

    if (process.env.LOCAL_DEV === 'true') {
      return true
    }
    return false
  },

  getAxios: async function () {
    if (!appAnalyticsMainService.axiosInstance) {
      const defaultOptions = {
        headers: {},
        baseURL: globalService.baseUrl
      }

      appAnalyticsMainService.axiosInstance = axios.create(defaultOptions)
    }
    return appAnalyticsMainService.axiosInstance
  }
}
