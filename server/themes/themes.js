var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const apiUrl = '/explorer/';
var contentService = require( '../services/content.service');

module.exports = {

    // getTheme: async function () {
    //   console.log('===>themes.getTheme');
    //     return await contentService.getPage('5cdb5cc2f744441df910f43f');
    // },

    // processTemplate: async function (html) {
    //     const $ = cheerio.load(html);
    //     $('.blog-header-logo').text('Cheerio');
    //     $('.blog-post-title').text('Cheerio Post');
    //     await this.processMenu($);
    //     // const $ = cheerio.load('<h2 class="title">Hello world</h2>')
 
    //     // $('h2.title').text('Hello there!')
    //     // console.log($.html());


    //     return $.html();
    // },

    // processMenu: async function($){

    //     let menuItemTemplate = $.html('.s--menu-item');
    //     let navWrapper = $('.s--menu-item').parent();
    //     navWrapper.empty();

    //     let menuItems = await this.getMenuItems();
    //     // console.log('menuItems &&&&', menuItems);
    //     menuItems.forEach(menuItem => {
    //         console.log(menuItem.data.name);
    //         let item = menuItemTemplate.replace('Menu Item', menuItem.data.name)
    //         navWrapper.append(item);
    //     });

    //     // console.log(menuItemTemplate);
    // },

    // getMenuItems: async function(){
    //     let data;
    //     let contentType = 'menu';
    //     const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    //     //axios.get(apiUrl + `contents?filter=${filter}`)
    //     await axios.get('/api/contents?filter=%7B%22where%22%3A%7B%22data.contentType%22%3A%22menu%22%7D%7D')
    //     .then(function (response) {
    //       // handle success
    //         // console.log('menu items ==>', response.data);
    //         data = response.data;
    //     })
    //     .catch(function (error) {
    //       // handle error
    //       console.log(error);
    //     })
    //     .then(function () {
    //       // always executed
    //     });
    //     return data;
    // }




      // async getContentByType(contentType) {
  //   const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
  //   let url = environment.apiUrl + `contents?filter=${filter}`;
  //   return this.http.get(url).toPromise();
  // }

}