var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
var listService = require(".//list.service");
var menuService = require(".//menu.service");
var helperService = require(".//helper.service");
var userService = require(".//user.service");
var globalService = require(".//global.service");
var cacheService = require(".//cache.service");

var dataService = require(".//data.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var eventBusService = require("./event-bus.service");

const apiUrl = "/api/";
var page;
var id;
var req;
var modulesToDelayProcessing = [];

const NodeCache = require("node-cache");
const myCache = new NodeCache();

module.exports = contentService = {
  startup: async function () {
    eventBusService.on(
      "postProcessModuleShortCodeProccessedHtml",
      async function (options) {
        if (options) {
          contentService.wrapBlockInModuleDiv(
            options.proccessedHtml,
            options.viewModel
          );
        }
      }
    );
  },

  getRenderedPage: async function (req) {
    this.req = req;
    // eventBusService.emit('getRenderedPagePreDataFetch', req);

    let cachedPage = cacheService.getCache().get(req.url);
    if (cachedPage !== undefined) {
      // console.log('returning from cache');
      return { page: cachedPage };
    } else {
      // console.log("no cache");
    }

    this.page = await dataService.getContentByUrl(req.url);

    if (this.page.data[0]) {
      await this.getPage(this.page.data[0].id, this.page.data[0]);
      await eventBusService.emit("postProcessPage");

      this.page.data.html = globalService.pageContent;
    }

    this.page.data.eventCount = 0;
    this.page.data.headerJs = "";

    await eventBusService.emit("getRenderedPagePostDataFetch", {
      req: req,
      page: this.page,
    });

    //handle 404
    if (!this.page || this.page.data.title == "Not Found") {
      //not found
      return { page: this.page };
    }

    let rows = [];
    this.page.data.hasRows = false;
    if (this.page.data.layout) {
      this.page.data.rows = this.page.data.layout.rows;
      this.page.data.hasRows = true;
    }

    await eventBusService.emit("preRender", { req: req, page: this.page });

    this.page.data.appVersion = globalService.getAppVersion;

    let cache = cacheService.getCache();
    success = cache.set(req.url, this.page);
    // console.log(success);

    return { page: this.page };
  },

  getPage: async function (id, instance) {
    if (!id) {
      return;
    }
    // log(chalk.green(id));
    this.id = id;
    if (instance) {
      this.page = instance;
    } else {
      if (id) {
        this.page = await dataService.getContentById(id);
      }
    }
    // console.log('id',id, instance);
    let themePath = __dirname + "/../themes/base/index.html";

    return new Promise((resolve, reject) => {
      fs.readFile(themePath, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          // console.log('data==>', data);
          this.processTemplate(data).then((html) => {
            resolve("ok");
            // console.log('getPage.page-->', html.length);
            // this.page.data.body = html;
            // pageBuilderService.processPageBuilder(this.page).then(pagebuilder => {
            //     // console.log('page-->2', pagebuilder.length);
            //     this.page.data.pagebuilder = pagebuilder;

            //     resolve(html);
            // })
          });
        }
      });
    });
  },

  getBlog: async function (req) {
    let blog = await dataService.getContentByUrl(req.url);
    blog = blog.data[0];
    if (blog) {
      blog.data.menu = await menuService.getMenu("Main");

      if (blog.data.image) {
        blog.data.heroImage = blog.data.image[0].originalName;
      }

      await eventBusService.emit("getRenderedPagePostDataFetch", {
        req: req,
        page: blog,
      });

      // let page = this.page.data[0];
      // this.page.data.html = globalService.pageContent;
      return { page: blog };
    }
    return "error";
  },

  getPageByUrl: async function (id, instance) {},

  // getSandboxPage: async function (id, instance) {
  //     let themePath = __dirname + '/../assets/html/sandbox.html';

  //     return new Promise((resolve, reject) => {
  //         fs.readFile(themePath, "utf8", (err, data) => {
  //             if (err) {
  //                 console.log(err);
  //                 reject(err);
  //             }
  //             else {
  //                 console.log('data==>', data);
  //                 this.processTemplate(data).then(html => {
  //                     resolve('sandbox');
  //                 })
  //             }
  //         });
  //     });
  // },

  processTemplate: async function (html) {
    globalService.pageContent = ""; //reset
    // this.setupShortCodeParser();
    // console.log('=== processTemplate ===')
    const $ = cheerio.load(html);

    await this.processSections($);
    await this.processDelayedModules();

    // await this.processPageBuilder($);
    // console.log('section content', globalService.pageContent);

    return $.html();
  },

  // processPageBuilder: async function ($) {

  //     let body = $('body');

  //     //load pb root index file
  //     let ui = await this.getPageBuilderUI();

  //     // console.log(pageBuilder);
  //     body.prepend(ui);
  // },

  // getPageBuilderUI: async function (){
  //     let themePath = __dirname + '/../page-builder/page-builder.html';

  //     return new Promise((resolve, reject) => {
  //         fs.readFile(themePath, "utf8", (err, data) => {
  //             if (err) {
  //                 console.log(err);
  //                 reject(err);
  //             }
  //             else {
  //                 // console.log('data==>', data);
  //                 resolve(data);
  //                 // this.processTemplate(data).then(html => {
  //                 //     resolve(html);
  //                 // })
  //             }
  //         });
  //     });
  // },

  processMenu: async function ($) {
    let menuItemTemplate = $.html(".s--menu-item");
    let navWrapper = $(".s--menu-item").parent();
    navWrapper.empty();

    let menuItems = await dataService.getContentByType("menu");
    // console.log('menuItems', menuItems);
    menuItems.forEach((menuItem) => {
      // console.log('menuItem', menuItem);
      let item = menuItemTemplate
        .replace("Home", menuItem.data.name)
        .replace("#", menuItem.url);
      navWrapper.append(item);
    });
  },

  processSections: async function ($) {
    await eventBusService.emit("preProcessSections");

    this.page.data.sections = [];
    let sectionWrapper = $(".s--section").parent(); //container
    sectionWrapper.empty();

    let page = this.page; // await this.getContentById('5cd5af93523eac22087e4358');
    // console.log('processSections:page==>', page);

    if (page.data && page.data.layout) {
      let sections = page.data.layout;

      await this.asyncForEach(sections, async (sectionId) => {
        let section = await dataService.getContentById(sectionId);
        if (section) {
          globalService.pageContent += `<section data-id='${section.id}' class="jumbotron-fluid">`;
          globalService.pageContent += '<div class="overlay">';
          globalService.pageContent += '<div class="container">';
          let rows;
          if (section.data.content) {
            //content will contain full layout
            globalService.pageContent += `${section.data.content}`;
            await this.processShortCodes(section, section.data.content);
          } else {
            //use page builder rows for layout
            rows = await this.processRows(
              section,
              $,
              sectionWrapper,
              section.data.rows
            );
          }
          globalService.pageContent += "</div>";
          globalService.pageContent += "</div>";
          globalService.pageContent += `</section>`;

          this.page.data.sections.push({
            id: sectionId,
            title: section.data.title,
            rows: rows,
          });
        }
      });

      sectionWrapper.append(globalService.pageContent);
    }
  },

  //TODO loop thru rows
  processRows: async function (section, $, sectionWrapper, rows) {
    let rowArray = [];
    let rowIndex = 0;

    await eventBusService.emit("preProcessRows");

    if (rows) {
      for (const row of rows) {
        // console.log(chalk.red(JSON.stringify(row)));
        globalService.pageContent += `<div class='${row.class}''>`;
        let columns = await this.processColumns(section, row, rowIndex);
        globalService.pageContent += `</div>`;

        rowArray.push(row);
        rowIndex++;
      }
    }
    // console.log('rowArray---->', rowArray);
    return rowArray;
  },

  processColumns: async function (section, row, rowIndex) {
    let columnArray = [];
    let columnIndex = 0;

    await eventBusService.emit("preProcessColumns");

    for (const column of row.columns) {
      // console.log('== column ==', column);

      globalService.pageContent += `<div id='${column.id}' class='${column.class}'>`;
      globalService.pageContent += `${column.content}`;
      if (column.content) {
        await this.processShortCodes(
          section,
          column.content,
          rowIndex,
          columnIndex
        );
      } else {
        globalService.pageContent += `<span class="empty-column">empty column</spam>`;
      }
      globalService.pageContent += `</div>`;
      columnArray.push(column);
      columnIndex++;
    }
    return columnArray;
  },

  processShortCodes: async function (section, body, rowIndex, columnIndex) {
    let parsedBlock = ShortcodeTree.parse(body);

    await eventBusService.emit("preProcessModuleShortCode");

    if (parsedBlock.children) {
      for (let bodyBlock of parsedBlock.children) {
        let shortcode = bodyBlock.shortcode;

        //new way:
        if (shortcode) {
          if (shortcode.properties.delayedProcessing) {
            modulesToDelayProcessing.push(shortcode);
            continue;
          }

          await eventBusService.emit("beginProcessModuleShortCode", {
            section: section,
            req: this.req,
            shortcode: shortcode,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
          });

          //old way, TODO: refac
          // if (shortcode.name == "BLOCK") {
          //   await this.replaceBlockShortCode(shortcode);
          // }
          // if (shortcode.name == "FORM") {
          //   await this.replaceFormShortCode(shortcode);
          // }
          // if (shortcode.name == "LIST") {
          //   await this.replaceListShortCode(shortcode);
          // }
        }
      }

      // console.log("done regular modules");
    }
  },

  //loop thru again to support modules that need delayed processing
  //ei: module B needs module A to process first so that it can use the data generated by module A
  processDelayedModules: async function () {
    for (let shortcode of modulesToDelayProcessing) {
      await eventBusService.emit("beginProcessModuleShortCodeDelayed", {
        section: undefined,
        req: this.req,
        shortcode: shortcode,
        rowIndex: 0,
        columnIndex: 0,
      });
    }
    // console.log("done delayed modules");
    // console.log("================");
  },

  wrapBlockInModuleDiv: function (proccessedHtml, viewModel) {
    let wrapperCss = "module";
    if (viewModel.data.settings && viewModel.data.settings.data.wrapperCss) {
      wrapperCss += " " + viewModel.data.settings.data.wrapperCss;
    }

    let wrapperStyles = "";
    if (viewModel.data.settings && viewModel.data.settings.data.wrapperStyles) {
      wrapperStyles = viewModel.data.settings.data.wrapperStyles;
    }
    proccessedHtml.body = `<div class="${wrapperCss}" style="${wrapperStyles}" data-id="${proccessedHtml.id}" data-module="${proccessedHtml.shortCode.name}" data-content-type="${proccessedHtml.contentType}">${proccessedHtml.body}</div>`;
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

  replaceBlockShortCode: async function (shortcode) {
    let blockId = shortcode.properties.id;
    let content = await dataService.getContentById(blockId);
    // console.log('replaceShortCode.getContentById', content);
    let newBody = `<span data-id="${blockId}">${content.data.body}</span>`;
    globalService.pageContent = globalService.pageContent.replace(
      shortcode.codeText,
      newBody
    );
  },

  replaceFormShortCode: async function (shortcode) {
    let blockId = shortcode.properties.id;
    let contentType = shortcode.properties.contentType;

    let form = await formService.getForm(contentType);
    // console.log('replaceFormShortCode.form', form);
    let newBody = form;
    globalService.pageContent = globalService.pageContent.replace(
      shortcode.codeText,
      newBody
    );
  },

  replaceListShortCode: async function (shortcode) {
    let blockId = shortcode.properties.id;
    let contentType = shortcode.properties.contentType;

    let list = await listService.getList(contentType);
    globalService.pageContent = globalService.pageContent.replace(
      shortcode.codeText,
      list
    );
  },

  asyncForEach: async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },
};
