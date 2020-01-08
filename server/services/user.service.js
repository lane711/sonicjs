var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');
var globalService = require('./global.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;



module.exports = userService = {

    startup: function () {

        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options) {
                options.page.data.showPageBuilder = await userService.isAuthenticated(options.req);
            }
        });

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


    getCurrentUserId: async function (req) {

        let tokenInfo = await globalService.AccessToken.findById(req.signedCookies.sonicjs_access_token);
        if(tokenInfo.userId){
            return tokenInfo.userId;
        }
    },

    // getCurrentUserId: async function (req) {

    //     return globalService.AccessToken.findById(req.signedCookies.sonicjs_access_token, async function (err, user) {
    //         if (err) {
    //             return -1;
    //         }
    //         console.log('internal:' + user.userId);
    //         return user.userId;
    //     });
    //     return 5;
    // },

    getCurrentUser: async function (req) {
    },

    isAuthenticated: async function (req) {
        var authCookie = await this.getToken(req);
        if (authCookie) {
            return true;
        }
        return false;
    },

    getToken: async function (req) {
        return req.signedCookies.sonicjs_access_token;
    }

}