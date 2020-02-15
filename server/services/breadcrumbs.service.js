var _ = require('lodash');

module.exports = breadcrumbsService = {
  getAdminBreadcrumbs: async function(req) {
    let path = req.path.split("/");
    let url = "";
    let breadcrumbs = [];
    path.forEach(pathItem => {
      if (pathItem) {
        url += "/" + pathItem;
        breadcrumbs.push({ title: _.startCase(pathItem), url: url });
      }
    });
    return breadcrumbs;
  }
};
