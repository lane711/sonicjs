require('./app-analytics-main-service')
const dataService = require('../../../services/data.service')
const dalService = require('../../../services/dal.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const moment = require('moment')
const axios = require('axios')
let axiosInstance

module.exports = appAnalyticsReportService = {
  getAggregates: async function (sessionID) {
    const contents = await dataService.getContentByType(
      'app-analytics',
      sessionID
    )

    contents.forEach(log => {
      if (log.data.firstSeenOn && log.data.lastSeenOn) {
        const age = moment(log.data.firstSeenOn).diff(log.data.lastSeenOn, 'days')
        log.data.age = age
      } else {
        log.data.age = '?'
      }
    })

    const data = {}
    data.count = contents.length
    data.installs = contents
    return data
  }
}
