var fs = require('fs');

exports.getMainMenuData = function () {
    if(global.menuData){
        return global.menuData;
    }
    global.menuData = JSON.parse(fs.readFileSync(appRootPath + '/data/menu.json', 'utf8'));
    return menuData;
}

exports.getAdminMenuData = function () {
    var menuData = JSON.parse(fs.readFileSync(appRootPath + '/data/menu-admin.json', 'utf8'));
    return menuData;
}