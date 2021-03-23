var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var emitterService = require("./emitter.service");
var dataService = require("./data.service");
var sharedService = require("./shared.service");

const apiUrl = "/api/";
var pageContent = "";
var page;
var id;
var sectionTemplate = "";
var rowTemplate = "";
var columnTemplate = "";

module.exports = pageBuilderService = {
  startup: async function (app) {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        options.page.data.showPageBuilder = await userService.isAuthenticated(
          options.req
        );
      }
    });

    app.post("/admin/pb-update-module-delete", async function (req, res) {
      let data = req.body.data;
      // console.log(data);

      if (data.isPageUsingTemplate && data.pageTemplateRegion) {
        let page = await dataService.getContentById(data.pageId);

        let region = page.data.pageTemplateRegions.filter(
          (r) => r.regionId === data.pageTemplateRegion
        )[0];

        let shortCodesInColumn = ShortcodeTree.parse(region.shortCodes);

        let shortCodeToRemove = shortCodesInColumn.children.filter(
          (s) => s.shortcode.properties.id === data.moduleId
        )[0];

        if (shortCodeToRemove && shortCodeToRemove.shortcode) {
          let newRegionShortCodes = region.shortCodes.replace(
            shortCodeToRemove.shortcode.codeText,
            ""
          );
          region.shortCodes = newRegionShortCodes;

          if (data.deleteContent) {
            await dataService.contentDelete(
              shortCodeToRemove.shortcode.properties.id
            );
          }
        }

        await dataService.editInstance(page);
      } else {
        let section = await dataService.getContentById(data.sectionId);
        let content =
          section.data.rows[data.rowIndex].columns[data.columnIndex].content;
        // console.log("content", content);

        // remove shortcode from the source column
        let shortCodesInColumn = ShortcodeTree.parse(content);
        let shortCodeToRemove = shortCodesInColumn.children[data.moduleIndex];
        // console.log("shortCodeToRemove", shortCodeToRemove);
        if (shortCodeToRemove && shortCodeToRemove.shortcode) {
          let newContent = content.replace(
            shortCodeToRemove.shortcode.codeText,
            ""
          );
          section.data.rows[data.rowIndex].columns[
            data.columnIndex
          ].content = newContent;
          // console.log("newContent", newContent);
          await dataService.editInstance(section);
        }
      }

      res.send(`ok`);
    });

    upsertPageRegion = function (
      page,
      destinationPageTemplateRegion,
      updatedDestinationContent
    ) {
      let region = page.data.pageTemplateRegions.filter(
        (r) => r.regionId === destinationPageTemplateRegion
      );

      if (region && region.length > 0) {
        region[0].shortCodes = updatedDestinationContent;
      } else {
        page.data.pageTemplateRegions.push({
          regionId: destinationPageTemplateRegion,
          shortCodes: updatedDestinationContent,
        });
      }
    };

    app.post("/admin/pb-update-module-sort", async function (req, res) {
      let data = req.body.data;
      console.log(data);

      if (data.isPageUsingTemplate && data.sourcePageTemplateRegion) {
        let page = await dataService.getContentById(data.pageId);

        let updatedDestinationContent = sharedService.generateShortCodeList(
          data.destinationModules
        );

        upsertPageRegion(
          page,
          data.destinationPageTemplateRegion,
          updatedDestinationContent
        );

        //moving between regions, need to remove from source
        if (
          data.sourcePageTemplateRegion !== data.destinationPageTemplateRegion
        ) {
          let sourceRegion = page.data.pageTemplateRegions.filter(
            (r) => r.regionId === data.sourcePageTemplateRegion
          );

          let shortCodesInColumn = ShortcodeTree.parse(
            sourceRegion[0].shortCodes
          );
          let shortCodeToRemove =
            shortCodesInColumn.children[data.sourceModuleIndex];
          // console.log("shortCodeToRemove", shortCodeToRemove);

          let updatedDestinationContent = (sourceRegion[0].shortCodes = sourceRegion[0].shortCodes.replace(
            shortCodesInColumn.text,
            ""
          ));
        }

        await dataService.editInstance(page);
      } else {
        let sourceSection = await dataService.getContentById(
          data.sourceSectionId
        );
        let content =
          sourceSection.data.rows[data.sourceRowIndex].columns[
            data.sourceColumnIndex
          ].content;
        // console.log("content", content);

        // remove shortcode from the source column
        if (data.sourceSectionId !== data.destinationSectionId) {
          let shortCodesInColumn = ShortcodeTree.parse(content);
          let shortCodeToRemove =
            shortCodesInColumn.children[data.sourceModuleIndex];
          // console.log("shortCodeToRemove", shortCodeToRemove);
          if (shortCodeToRemove && shortCodeToRemove.shortcode) {
            let newContent = content.replace(
              shortCodeToRemove.shortcode.codeText,
              ""
            );
            sourceSection.data.rows[data.sourceRowIndex].columns[
              data.sourceColumnIndex
            ].content = newContent;
            // console.log("newContent", newContent);
            await dataService.editInstance(sourceSection);
          }
        }

        //regen the destination
        let destinationSection = await dataService.getContentById(
          data.destinationSectionId
        );

        let updatedDestinationContent = sharedService.generateShortCodeList(
          data.destinationModules
        );
        // console.log("updatedDestinationContent", updatedDestinationContent);
        destinationSection.data.rows[data.destinationRowIndex].columns[
          data.destinationColumnIndex
        ].content = updatedDestinationContent;

        let r = await dataService.editInstance(destinationSection);
      }
      res.send(`ok`);
    });

    app.post("/admin/pb-update-module-copy", async function (req, res) {
      let data = req.body.data;
      console.log(data);

      let section = await dataService.getContentById(data.sectionId);
      let content =
        section.data.rows[data.rowIndex].columns[data.columnIndex].content;
      console.log("content", content);

      //copy module
      let moduleToCopy = await dataService.getContentById(data.moduleId);
      let newModule = await dataService.contentCreate(moduleToCopy);

      let sectionColumn =
        section.data.rows[data.rowIndex].columns[data.columnIndex];

      let shortCodesInColumn = ShortcodeTree.parse(sectionColumn.content);

      // generate short code ie: [MODULE-HELLO-WORLD id="123"]
      let args = { id: newModule.id };
      let moduleInstanceShortCodeText = sharedService.generateShortCode(
        `${newModule.data.contentType}`,
        args
      );

      let moduleInstanceShortCode = ShortcodeTree.parse(
        moduleInstanceShortCodeText
      ).children[0];

      shortCodesInColumn.children.splice(
        data.moduleIndex + 1,
        0,
        moduleInstanceShortCode
      );

      let newShortCodeContent = sharedService.generateContentFromShortcodeList(
        shortCodesInColumn
      );

      section.data.rows[data.rowIndex].columns[
        data.columnIndex
      ].content = newShortCodeContent;

      let result = await dataService.editInstance(section);

      res.send(`ok`);
      // // return;
    });
  },
  // module.exports = {

  //     foo: function () {
  //         return 'bar';
  //     },

  processPageBuilder: async function (page) {
    // console.log('<==processPageBuilder', page);
    this.page = page;
    const $ = cheerio.load(page.data.body);

    let body = $("body");

    //load pb root index file
    let ui = await this.getPageBuilderUI();

    // console.log(pageBuilder);
    // body.prepend(ui);

    // return $.html();
    return ui;
  },

  getPageBuilderUI: async function () {
    let themePath = __dirname + "/../page-builder/page-builder.html";

    return new Promise((resolve, reject) => {
      fs.readFile(themePath, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          // console.log('data==>', data);
          // this.processTemplate(data).then(html => {
          //     resolve(html);
          // })
        }
      });
    });
  },

  // processTemplate: async function (html) {
  //     pageContent = ''; //reset
  //     // this.setupShortCodeParser();
  //     // console.log('=== processTemplate ===')
  //     const $ = cheerio.load(html);
  //     // $('#page-id').val(this.page.id);
  //     await this.loadHtmlTemplates($);

  //     // $('.blog-header-logo').text(this.page.id);
  //     // $('.blog-post-title').text('Cheerio Post');
  //     // await this.processMenu($);

  //     await this.processSections($);

  //     // await this.processPageBuilder($);

  //     return $.html();
  // },

  loadHtmlTemplates: async function ($) {
    this.columnTemplate = $.html(".s--column");
    // console.log(chalk.blue('columnTemplate-->', this.columnTemplate));

    this.rowTemplate = $.html(".s--row").replace(
      this.columnTemplate,
      "[[columnTemplate]]"
    );
    // console.log(chalk.green('rowTemplate-->', this.rowTemplate));

    this.sectionTemplate = $.html(".s--section").replace(
      this.rowTemplate,
      "[[rowTemplate]]"
    );
    // console.log(chalk.cyan('sectionTemplate-->', this.sectionTemplate));
  },

  // processSections: async function ($) {

  //     let sectionWrapper = $('.s--section').parent();
  //     sectionWrapper.empty();

  //     // console.log('sectionTemplate', sectionTemplate);

  //     if (this.page.data && this.page.data.layout) {
  //         let sections = this.page.data.layout;

  //         await this.asyncForEach(sections, async (sectionId) => {
  //             let section = await this.getContentById(sectionId);
  //             pageContent += this.sectionTemplate.replace('{{section.data.title}}', section.data.title);
  //             // console.log(section);
  //             // pageContent += `${section.data.title}`;
  //             await this.processRows($, section.data.rows)

  //             // console.log(section);
  //         });

  //         sectionWrapper.append(pageContent);
  //     }
  // },

  // processRows: async function ($, rows) {
  //     let rowTemplate = $.html('.s--row');
  //     // console.log('rowTemplate', rowTemplate);
  //     for (const row of rows) {
  //         pageContent += `<div class='row'>ROW`;
  //         // await this.processColumns(row)
  //         pageContent += `</div>`;
  //     }
  // },

  // processColumns: async function (row) {
  //     for (const column of row.columns) {
  //         // console.log('== column ==')
  //         pageContent += `<div class='${column.class}'>`;
  //         pageContent += `${column.content}`;
  //         await this.processBlocks(column.content);
  //         pageContent += `</div>`;
  //     }
  // },

  // processBlocks: async function (blocks) {
  //     await this.processShortCodes(blocks);
  // },

  // processShortCodes: async function (body) {
  //     let bodyBlocks = ShortcodeTree.parse(body);
  //     if (bodyBlocks.children) {
  //         for (let bodyBlock of bodyBlocks.children) {
  //             let shortcode = bodyBlock.shortcode;
  //             if (shortcode.name == "BLOCK") {
  //                 await this.replaceShortCode(shortcode)
  //             }
  //         }
  //     }
  // },

  getContentById: async function (id) {
    let url = `${apiUrl}content/${id}`;
    // console.log('url', url);
    let page = await axios.get(url);
    page.data.html = undefined;
    // console.log('getContent', page.data);
    return page.data;
  },

  asyncForEach: async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },
};
