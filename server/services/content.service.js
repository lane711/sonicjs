var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
var ShortcodeTree = require('shortcode-tree').ShortcodeTree;

const apiUrl = 'http://localhost:3000/api/';
var pageContent = '';
var page;
var id;

module.exports = {

    foo: function () {
        return 'bar';
    },

    getPage: async function (id, instance) {
        this.id = id;
        this.page = instance;
        console.log('id',id, instance);
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
        // this.setupShortCodeParser();
        // console.log('=== processTemplate ===')
        const $ = cheerio.load(html);
        $('.blog-header-logo').text('Cheerio');
        $('.blog-post-title').text('Cheerio Post');
        await this.processMenu($);

        await this.processSections($);

        return $.html();
    },

    processMenu: async function ($) {

        let menuItemTemplate = $.html('.s--menu-item');
        let navWrapper = $('.s--menu-item').parent();
        navWrapper.empty();

        let menuItems = await this.getMenuItems();
        menuItems.forEach(menuItem => {
            let item = menuItemTemplate.replace('Menu Item', menuItem.data.name)
            navWrapper.append(item);
        });
    },

    processSections: async function ($) {

        let sectionWrapper = $('.s--section').parent(); //container
        sectionWrapper.empty();

        let page = this.page; // await this.getContentById('5cd5af93523eac22087e4358');
        console.log('processSections:page==>', page);
        let sections = page.data.layout;

        await this.asyncForEach(sections, async (sectionId) => {
            let section = await this.getContentById(sectionId);
            pageContent += `<section>`;
            await this.processRows($, sectionWrapper, section.data.rows)
            pageContent += `</section>`;

            // console.log(section);
        });

        sectionWrapper.append(pageContent);
    },

    //TODO loop thru rows
    processRows: async function ($, sectionWrapper, rows) {
        for (const row of rows) {
            pageContent += `<div class='row'>`;
            await this.processColumns(row)
            pageContent += `</div>`;
        }
    },

    processColumns: async function (row) {
        for (const column of row.columns) {
            console.log('== column ==')
            pageContent += `<div class='${column.class}'>`;
            pageContent += `${column.content}`;
            await this.processBlocks(column.content);
            pageContent += `</div>`;
        }
    },

    processBlocks: async function(blocks){
        this.processShortCodes(blocks);
        // const parser = Shortcode();

        // await parser.add('BLOCK', tag=>{ 
        //     let blockId = tag.attributes.id
        //     console.log('in parser callback blockId:-->', blockId);
        //     // this.processBlock(blockId);
        //     return blockId;
        // });

        // await parser.add('BLOCK', tag=>{ // add handler for CONTENT tag
        //     return new Promise(async (resolve, reject)=>{ // Use the id attribute of the tag to do a lookup-up
        //         try{
        //             let blockId = tag.attributes.id
        //             // console.log('in parser callback blockId:-->', blockId);
        //             // await this.processBlock(blockId);
        //             return blockId;
        //         }
        //         catch(error){
        //             console.log(error);
        //         }
        //     });
        // });

        // await parser.parse(blocks).then(blockId =>{
        //     // console.log('parser resolve', blockId);
        //     // await this.processBlock(blockId);

        // })
    },

    // processBlocks: async function (blocks) {

    //     let blockIds = await this.processShortCodes(blocks);
    //     // console.log('blockIds', blockIds);
    //     for(const blockId of blockIds){
    //         await this.processBlock(blockId);
    //     }

    // },

    processShortCodes: async function(body){
        let shortCodes =  body.split(']][[');
        let ids = [];
        for(const shortCode of shortCodes){
            var rootNode = ShortcodeTree.parse('[image id=123 src="bla.jpg" align="center"/]');
            console.log(rootNode);
        }

        return ids;
    },

    // setupShortCodeParser: async function(){
    //     await parser.add('BLOCK', tag=>{ 
    //                         try{
    //                 let blockId = tag.attributes.id
    //                 console.log('in parser callback blockId:-->', blockId);
    //                 await this.processBlock(blockId);
    //                 return blockId;
    //             }
    //             catch(error){
    //                 console.log(error);
    //             }
    //         // let blockId = tag.attributes.id
    //         // console.log('in parser callback blockId:-->', blockId);
    //         // await this.processBlock(blockId);
    //         // return blockId;
    //     });
    // },

    processBlock: async function (blockId) {
        let content = await this.getContentById(blockId);
        // console.log('processBlock==>', content.data.body);
        pageContent += content.data.body;
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
        // console.log('url', url);
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