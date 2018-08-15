var fs = require('fs');

exports.getPageData = function (pageId) {
    return this.getAllPageData().filter(
        page => page.id === pageId)[0];
}


exports.getAllPageData = function () {
    if (global.pageData) {
        return global.pageData;
    }
    global.pageData = JSON.parse(fs.readFileSync(appRootPath + '/data/pages.json', 'utf8'));
    return pageData;
}