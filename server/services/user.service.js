var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;



module.exports = userService = {

    startup: function () {
        // console.log('>>=== menu startup');

        // eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
        //     if (options) {
        //         menuService.getMenu('Main').then(data => {
        //             options.page.data.menu = data;
        //         })
        //     }
        // });
    },

    getUsers: async function (menuName) {
        let menuData = await dataService.getContentByContentTypeAndTitle('menu', menuName);
        let links = menuData.data.links;
        let menu = [];

        for (let index = 0; index < links.length; index++) {
            const item = links[index];

            if (item.level == 0) {
                let hasChildren = this.hasChildren(links, index);

                let childLinks = this.getChildren(links, hasChildren, index);

                menu.push({
                    url: item.url,
                    title: item.title,
                    hasChildren: hasChildren,
                    childLinks: childLinks
                });
            }
        }

        // menuData.data.links.forEach(item => {
        //     menu.push({url: item.url});
        // });

        return menu;
    },

    isAuthenticated: async function (req) {
        var authCookie = req.signedCookies.sonicjs_access_token;
        if(authCookie){
            return true;
        }
        return false;
    }

}