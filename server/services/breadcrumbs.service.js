const _ = require('lodash')

module.exports = breadcrumbsService = {
  getAdminBreadcrumbs: async function (req) {
    const path = req.path.split('/')
    let url = ''
    const breadcrumbs = []
    path.forEach(pathItem => {
      if (pathItem) {
        url += '/' + pathItem
        breadcrumbs.push({ title: _.startCase(pathItem), url: url })
      }
    })
    return breadcrumbs
  }
}
