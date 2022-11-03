var pageBuilderService = require(".//page-builder.service");
var formService = require(".//form.service");
var listService = require(".//list.service");
var menuService = require(".//menu.service");
var helperService = require(".//helper.service");
var userService = require(".//user.service");
var globalService = require(".//global.service");
var cacheService = require(".//cache.service");
var cssService = require(".//css.service");
var formattingService = require(".//formatting.service");
var frontEndTheme = `${process.env.FRONT_END_THEME}`;

var dataService = require(".//data.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var emitterService = require("./emitter.service");

var modulesToDelayProcessing = [];

const NodeCache = require("node-cache");
const fileService = require("./file.service");

module.exports = contentService = {
  startup: async function () {
    emitterService.on(
      "postProcessModuleShortCodeProcessedHtml",
      async function ({ options }) {
        if (options) {
          contentService.wrapBlockInModuleDiv(options);
        }
      }
    );
  },

  getRenderedPage: async function (req) {
    // emitterService.emit('getRenderedPagePreDataFetch', req);

    if (process.env.ENABLE_CACHE === "TRUE") {
      let cachedPage = cacheService.getCache().get(req.url);
      if (cachedPage !== undefined) {
        // console.log('returning from cache');
        return { page: cachedPage };
      } else {
        // console.log("no cache");
      }
    }

    await emitterService.emit("preProcessPageUrlLookup", req);

    let page = await dataService.getContentByUrl(req.url, req.sessionID);

    await emitterService.emit("postPageDataFetch", { req: req, page: page });

    if (page.data) {
      //page templates
      if (page.data.pageTemplate) {
        // console.log(page.data.pageTemplate)
        let pageTemplate = await dataService.getContentById(
          page.data.pageTemplate,
          req.sessionID
        );

        //merge data
        if (pageTemplate && pageTemplate.data.pageCssClass) {
          page.data.pageCssClass += " " + pageTemplate.data.pageCssClass;
        }
      }

      await this.getPage(page.id, page, req, req.sessionID);
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

    return { page: page };
  },

  getPage: async function (id, page, req, sessionID) {
    if (!id) {
      return;
    }

    await this.processTemplate(page, req, sessionID);

    return page.data.html;
  },

  getBlog: async function (req) {
    let blog = await dataService.getContentByUrl(req.url, req.sessionID);
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

  processTemplate: async function (page, req, sessionID) {
    page.data.html = ""; //reset
    // const $ = cheerio.load("");

    await this.processSections(page, req, req.sessionID);
    await this.processDelayedModules(page, req, req.sessionID);

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

  processSections: async function (page, req, sessionID) {
    await emitterService.emit("preProcessSections", { page: page, req: req });

    page.data.sections = [];
    // let sectionWrapper = $(".s--section").parent(); //container
    // sectionWrapper.empty();

    // let page = page; // await this.getContentById('5cd5af93523eac22087e4358');
    // console.log('processSections:page==>', page);

    if (page.data && page.data.layout.length > 0) {
      let sections = page.data.layout;

      for (const section of sections) {
        await this.renderSection(page, section.sectionId, sessionID, req);
      }

      // sectionWrapper.append(page.data.html);
    } else {
      //new page with no sections yet
      page.data.html += `<section class="jumbotron-fluid pb new-page-no-sections">`;
      page.data.html += '<div class="container pb-empty-section">';
      page.data.html += '<div class="row">';
      page.data.html += '<div class="col">';
      page.data.html += `<div class="mb-5"><h4>Your Page Has No Sections Yet</h4></div>`;
      page.data.html += `<div><button type="button" class="btn btn-success section-add-below">
      <i class="nav-icon fa fa-plus"></i> Add Section</button></div>`;
      page.data.html += "</div>";
      page.data.html += "</div>";
      page.data.html += "</div>";
      page.data.html += `</section>`;
    }
  },

  renderSection: async function (page, sectionId, sessionID, req, sectionData) {
    //sections can be overridden at a theme level, let's first check if the section is manually overriden in code
    let sectionViewPath = `${frontEndTheme}/sections/${sectionId}.hbs`;

    if (fileService.fileExists(sectionViewPath)) {
      let sectionContent = await fileService.getFile(sectionViewPath);
      page.data.html += sectionContent;
    } else {
      let section = await dataService.getContentById(sectionId, sessionID);
      if (section) {
        section.data = sectionData ?? section.data;

        if (section.data.content) {
          //process raw column without rows and columns
          page.data.html += `${section.data.content}`;
          await this.processShortCodes(
            page,
            section,
            section.data.content,
            0,
            0,
            req
          );
        } else {
          let sectionClass = section.data.cssClass
            ? section.data.cssClass + " "
            : "";
          let sectionCss = await cssService.getSectionStyle(section);
          console.log("sectionCss", sectionCss);
          // let overlayStyle = await this.getSectionOverlayStyle(section);
          let sectionMiniGuid = section.id.substr(section.id.length - 12);

          page.data.html += '<style>';
          page.data.html += `\n.pb .css-${sectionMiniGuid}{${sectionCss?.style}}\n`
          page.data.html += '</style>';

          page.data.html += `<section data-id='${section.id}' data-title='${section.data.title}' class="${sectionClass}jumbotron-fluid css-${sectionMiniGuid} ${sectionCss?.css} ${sectionCss?.margin}">`;
          page.data.html += `<div class="section-overlay overlay-${sectionMiniGuid} ${sectionCss?.padding}">`;
          page.data.html += '<div class="container">';
          let rows;
          rows = await this.processRows(page, section, section.data.rows, req);
          page.data.html += "</div>";
          page.data.html += "</div>";
          page.data.html += `</section>`;

          page.data.sections.push({
            id: sectionId,
            title: section.data.title,
            rows: rows,
          });
        }
      }
    }
  },

  getSectionOverlayStyle: async function (section) {
    if (section.data.overlay) {
      console.log(
        "getting section overlay",
        section.data.overlayTopColor,
        section.data.overlayBottomColor
      );
      // background-image: linear-gradient(rgba(255,255,255,0.9),rgba(255,255,255,0.7));

      let style = `background-image: linear-gradient(${section.data.overlayTopColor}, ${section.data.overlayBottomColor})`;
      // style = `background-image: linear-gradient(rgba(255,255,255,0.9),rgba(255,255,255,0.7))`;

      return style;
    }
  },

  //TODO loop thru rows
  processRows: async function (page, section, rows, req) {
    let rowArray = [];
    let rowIndex = 0;

    await emitterService.emit("preProcessRows");

    if (rows) {
      for (const row of rows) {
        // console.log(chalk.red(JSON.stringify(row)));
        page.data.html += `<div class='${row.css}'>`;
        let columns = await this.processColumns(
          page,
          section,
          row,
          rowIndex,
          req
        );
        page.data.html += `</div>`;

        rowArray.push(row);
        rowIndex++;
      }
    }
    // console.log('rowArray---->', rowArray);
    return rowArray;
  },

  processColumns: async function (page, section, row, rowIndex, req) {
    let columnArray = [];
    let columnIndex = 0;

    await emitterService.emit("preProcessColumns");

    for (const column of row.columns) {
      // console.log('== column ==', column);

      page.data.html += `<div class='${column.css}'>`;
      let content = "";
      if (Array.isArray(column.content)) {
        column.content.map((c, index) => {
          content += c.content;
        });
      }
      page.data.html += `${content}`;
      if (content) {
        await this.processShortCodes(
          page,
          section,
          content,
          rowIndex,
          columnIndex,
          req
        );
      } else {
        //only show for admin
        if (req.user) {
          page.data.html += `<span class="empty-column"><h5>Empty Column</h5><p>(drag element here)</p></span>`;
        }
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
    columnIndex,
    req
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
            req: req,
            shortcode: shortcode,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
          });

          // if (wrapWithModuleDiv) {
          //   var processedHtml = {
          //     id: shortcode.properties.id,
          //     shortCode: shortcode,
          //     contentType: shortcode.name,
          //     body: options.page.data.currentShortCodeHtml,
          //   };

          //   contentService.wrapBlockInModuleDiv(processedHtml, undefined);
          //   page.data.currentShortCodeHtml = processedHtml;
          // }
        }
      }

      // console.log("done regular modules");
    }
  },

  //loop thru again to support modules that need delayed processing
  //ei: module B needs module A to process first so that it can use the data generated by module A
  processDelayedModules: async function (page, req, sessionID) {
    for (let shortcode of modulesToDelayProcessing) {
      await emitterService.emit("beginProcessModuleShortCodeDelayed", {
        page: page,
        section: undefined,
        req: req,
        shortcode: shortcode,
        rowIndex: 0,
        columnIndex: 0,
      });
    }
  },

  wrapBlockInModuleDiv: function (options) {
    let wrapperCss = "module";
    if (
      options.viewModel &&
      options.viewModel.data.settings &&
      options.viewModel.data.settings.data.wrapperCss
    ) {
      wrapperCss += " " + options.viewModel.data.settings.data.wrapperCss;
    }

    let wrapperStyles = "";
    if (
      options.viewModel &&
      options.viewModel.data.settings &&
      options.viewModel.data.settings.data.wrapperStyles
    ) {
      wrapperStyles = options.viewModel.data.settings.data.wrapperStyles;
    }
    options.processedHtml.body = formattingService.generateModuleDivWrapper(
      options.processedHtml.id,
      wrapperCss,
      wrapperStyles,
      options.processedHtml.shortCode.name,
      options.processedHtml.contentType,
      options.processedHtml.body,
      false,
      options.page.data.pageTemplate !== "none"
    );
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

    let form = await formService.getForm(
      contentType,
      undefined,
      undefined,
      undefined,
      undefined,
      sessionID
    );

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
