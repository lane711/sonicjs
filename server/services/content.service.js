var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const apiUrl = 'http://localhost:3000/api/';

module.exports = {

    foo: function () {
        return 'bar';
    },

    getTheme: async function () {
        console.log('=== content service path:' + __dirname);
        let themePath = __dirname + '/../themes/base/index.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log('data==>', data);
                    this.processTemplate(data).then(html => {
                        resolve(html);
                    })
                }
            });
        });

    },

    processTemplate: async function (html) {
        // console.log('=== processTemplate ===')
        const $ = cheerio.load(html);
        $('.blog-header-logo').text('Cheerio');
        $('.blog-post-title').text('Cheerio Post');
        await this.processMenu($);

        await this.processSections($);

        // const $ = cheerio.load('<h2 class="title">Hello world</h2>')

        // $('h2.title').text('Hello there!')
        // console.log($.html());


        return $.html();
    },

    processMenu: async function ($) {

        let menuItemTemplate = $.html('.s--menu-item');
        let navWrapper = $('.s--menu-item').parent();
        navWrapper.empty();

        let menuItems = await this.getMenuItems();
        // console.log('menuItems &&&&', menuItems);
        menuItems.forEach(menuItem => {
            // console.log(menuItem.data.name);
            let item = menuItemTemplate.replace('Menu Item', menuItem.data.name)
            navWrapper.append(item);
        });

        // console.log(menuItemTemplate); 
    },

    processSections: async function ($) {

        let sectionWrapper = $('.s--section').parent(); //container
        sectionWrapper.empty();

        let page = await this.getContentById('5cd5af93523eac22087e4358');
        let sections = page.data.layout;
        
        await this.asyncForEach(sections, async (sectionId) => {
            let section = await this.getContentById(sectionId);
            await sectionWrapper.append(`<section>`);
            await this.processRows($, sectionWrapper, section.data.rows)
            await sectionWrapper.append(`</section>`);

            console.log(section);
          });
        //   console.log($.html());

        // asyncForEach(sectionssectionId => {
        //     console.log(section);
        //     //get section from db
        //     let section = await this.getContentById(sectionId);
        //     console.log('section==>', section);
        //     // let item = menuItemTemplate.replace('Menu Item', menuItem.data.name)
        //     // navWrapper.append(item);
        // });

        // console.log(menuItemTemplate);
    },

    //TODO loop thru rows
    processRows: async function ($, sectionWrapper, rows) {
        await sectionWrapper.append(`<div class='row'>`);
        await this.processColumns($, sectionWrapper, rows)
        await sectionWrapper.append(`</div>`);
    },

    processColumns: async function ($, sectionWrapper, rows) {
        await sectionWrapper.append(`<div class='col'>ipsum`);
        await sectionWrapper.append(`</div>`);
    },


    getContent: async function (id, contentType) {

        const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
        //axios.get(apiUrl + `contents?filter=${filter}`)
        let url = `${apiUrl}contents?filter=${filter}`;
        console.log('url', url);
        let page = await axios.get(url);
        // page.data.html = 'delete this';
        // console.log('getContent', page.data);
        return page.data;
    },

    getContentById: async function (id) {
        let url = `${apiUrl}contents/${id}`;
        console.log('url', url);
        let page = await axios.get(url);
        page.data.html = undefined;
        // console.log('getContent', page.data);
        return page.data;
    },

    getMenuItems: async function () {
        let data;
        let contentType = 'menu';
        const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
        //axios.get(apiUrl + `contents?filter=${filter}`)
        await axios.get('http://localhost:3000/api/contents?filter=%7B%22where%22%3A%7B%22data.contentType%22%3A%22menu%22%7D%7D')
            .then(function (response) {
                // handle success
                // console.log('menu items ==>', response.data);
                data = response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
        return data;
    },

    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }


    // async getContentByType(contentType) {
    //   const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    //   let url = environment.apiUrl + `contents?filter=${filter}`;
    //   return this.http.get(url).toPromise();
    // }

}