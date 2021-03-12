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
var emitterService = require("./emitter.service");

const apiUrl = "/api/";
var page;
var id;
var req;
var modulesToDelayProcessing = [];

const NodeCache = require("node-cache");
const myCache = new NodeCache();

module.exports = contentService = {
  startup: async function () {
    emitterService.on(
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
    // emitterService.emit('getRenderedPagePreDataFetch', req);

    let cachedPage = cacheService.getCache().get(req.url);
    if (cachedPage !== undefined) {
      // console.log('returning from cache');
      return { page: cachedPage };
    } else {
      // console.log("no cache");
    }

    await emitterService.emit("preProcessPageUrlLookup", req);

    let page = await dataService.getContentByUrl(req.url);

    if (page.data) {
      //page templates
      if (page.data.pageTemplate) {
        // console.log(page.data.pageTemplate)
        // let pageTemplate = await dataService.getContentById(page.data.pageTemplate);
        // console.log(pageTemplate)
        // let processedTemplate = await this.getPage(pageTemplate.id, pageTemplate.data);
        //merge data?
      }

      await this.getPage(page.id, page);
      await emitterService.emit("postProcessPage");

      // page.data.html = page.data.html;
    }

    page.data.eventCount = 0;
    page.data.headerJs = "";

    await emitterService.emit("getRenderedPagePostDataFetch", {
      req: req,
      page: page,
    });

    //handle 404
    if (!page || page.data.title == "Not Found") {
      //not found
      return { page: page };
    }

    let rows = [];
    page.data.hasRows = false;
    if (page.data.layout) {
      page.data.rows = page.data.layout.rows;
      page.data.hasRows = true;
    }

    await emitterService.emit("preRender", { req: req, page: page });

    page.data.appVersion = globalService.getAppVersion;

    page.data.metaTitle = page.data.metaTitle
      ? page.data.metaTitle
      : page.data.title;

    let cache = cacheService.getCache();
    success = cache.set(req.url, page);
    // console.log(success);

    return { page: page };
  },

  getPage: async function (id, page) {
    if (!id) {
      return;
    }

    await this.processTemplate(page);

    return page.data.html;
  },

  getBlog: async function (req) {
    let blog = await dataService.getContentByUrl(req.url);
    blog = blog.data[0];
    if (blog) {
      blog.data.menu = await menuService.getMenu("Main");

      if (blog.data.image) {
        blog.data.heroImage = blog.data.image[0].originalName;
      }

      await emitterService.emit("getRenderedPagePostDataFetch", {
        req: req,
        page: blog,
      });

      // let page = page.data[0];
      // page.data.html = page.data.html;
      return { page: blog };
    }
    return "error";
  },

  getPageByUrl: async function (id, instance) {},

  processTemplate: async function (page) {
    page.data.html = ""; //reset
    // const $ = cheerio.load("");

    await this.processSections(page);
    await this.processDelayedModules();

    // return $.html();
  },

  processMenu: async function () {
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

  processSections: async function (page) {
    await emitterService.emit("preProcessSections");

    page.data.sections = [];
    // let sectionWrapper = $(".s--section").parent(); //container
    // sectionWrapper.empty();

    // let page = page; // await this.getContentById('5cd5af93523eac22087e4358');
    // console.log('processSections:page==>', page);

    if (page.data && page.data.layout) {
      let sections = page.data.layout;

      await this.asyncForEach(sections, async (sectionId) => {
        let section = await dataService.getContentById(sectionId);
        if (section) {
          page.data.html += `<section data-id='${section.id}' class="jumbotron-fluid">`;
          page.data.html += '<div class="overlay">';
          page.data.html += '<div class="container">';
          let rows;
          if (section.data.content) {
            //content will contain full layout
            page.data.html += `${section.data.content}`;
            await this.processShortCodes(section, section.data.content);
          } else {
            //use page builder rows for layout
            rows = await this.processRows(
              page,
              section,
              section.data.rows
            );
          }
          page.data.html += "</div>";
          page.data.html += "</div>";
          page.data.html += `</section>`;

          page.data.sections.push({
            id: sectionId,
            title: section.data.title,
            rows: rows,
          });
        }
      });

      // sectionWrapper.append(page.data.html);
    }
  },

  //TODO loop thru rows
  processRows: async function (page, section, rows) {
    let rowArray = [];
    let rowIndex = 0;

    await emitterService.emit("preProcessRows");

    if (rows) {
      for (const row of rows) {
        // console.log(chalk.red(JSON.stringify(row)));
        page.data.html += `<div class='${row.class}''>`;
        let columns = await this.processColumns(page, section, row, rowIndex);
        page.data.html += `</div>`;

        rowArray.push(row);
        rowIndex++;
      }
    }
    // console.log('rowArray---->', rowArray);
    return rowArray;
  },

  processColumns: async function (page, section, row, rowIndex) {
    let columnArray = [];
    let columnIndex = 0;

    await emitterService.emit("preProcessColumns");

    for (const column of row.columns) {
      // console.log('== column ==', column);

      page.data.html += `<div id='${column.id}' class='${column.class}'>`;
      page.data.html += `${column.content}`;
      if (column.content) {
        await this.processShortCodes(
          page,
          section,
          column.content,
          rowIndex,
          columnIndex
        );
      } else {
        page.data.html += `<span class="empty-column">empty column</spam>`;
      }
      page.data.html += `</div>`;
      columnArray.push(column);
      columnIndex++;
    }
    return columnArray;
  },

  processShortCodes: async function (
    page,
    section,
    body,
    rowIndex,
    columnIndex
  ) {
    let parsedBlock = ShortcodeTree.parse(body);

    await emitterService.emit("preProcessModuleShortCode");

    if (parsedBlock.children) {
      for (let bodyBlock of parsedBlock.children) {
        let shortcode = bodyBlock.shortcode;

        //new way:
        if (shortcode) {
          if (shortcode.properties.delayedProcessing) {
            modulesToDelayProcessing.push(shortcode);
            continue;
          }

          await emitterService.emit("beginProcessModuleShortCode", {
            page: page,
            section: section,
            req: this.req,
            shortcode: shortcode,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
          });
        }
      }

      // console.log("done regular modules");
    }
  },

  //loop thru again to support modules that need delayed processing
  //ei: module B needs module A to process first so that it can use the data generated by module A
  processDelayedModules: async function () {
    for (let shortcode of modulesToDelayProcessing) {
      await emitterService.emit("beginProcessModuleShortCodeDelayed", {
        page: page,
        section: undefined,
        req: this.req,
        shortcode: shortcode,
        rowIndex: 0,
        columnIndex: 0,
      });
    }
  },

  wrapBlockInModuleDiv: function (proccessedHtml, viewModel) {
    let wrapperCss = "module";
    if (viewModel && viewModel.data.settings && viewModel.data.settings.data.wrapperCss) {
      wrapperCss += " " + viewModel.data.settings.data.wrapperCss;
    }

    let wrapperStyles = "";
    if (viewModel && viewModel.data.settings && viewModel.data.settings.data.wrapperStyles) {
      wrapperStyles = viewModel.data.settings.data.wrapperStyles;
    }
    proccessedHtml.body = `<div class="${wrapperCss}" style="${wrapperStyles}" data-id="${proccessedHtml.id}" data-module="${proccessedHtml.shortCode.name}" data-content-type="${proccessedHtml.contentType}">${proccessedHtml.body}</div>`;
  },

  replaceBlockShortCode: async function (page, shortcode) {
    let blockId = shortcode.properties.id;
    let content = await dataService.getContentById(blockId);
    // console.log('replaceShortCode.getContentById', content);
    let newBody = `<span data-id="${blockId}">${content.data.body}</span>`;
    page.data.html = page.data.html.replace(shortcode.codeText, newBody);
  },

  replaceFormShortCode: async function (page, shortcode) {
    let blockId = shortcode.properties.id;
    let contentType = shortcode.properties.contentType;

    let form = await formService.getForm(contentType);

    page.data.html = page.data.html.replace(shortcode.codeText, form);
  },

  replaceListShortCode: async function (page, shortcode) {
    let blockId = shortcode.properties.id;
    let contentType = shortcode.properties.contentType;

    let list = await listService.getList(contentType);
    page.data.html = page.data.html.replace(shortcode.codeText, list);
  },

  asyncForEach: async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },
};
