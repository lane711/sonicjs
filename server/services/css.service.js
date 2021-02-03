var dataService = require("./data.service");
var helperService = require("./helper.service");
var fileService = require("./file.service");
var moduleService = require("./module.service");
var globalService = require("./global.service");
var viewService = require("./view.service");

var emitterService = require("./emitter.service");
const css = require("css");
const axios = require("axios");
var csstree = require("css-tree");
var cssbeautify = require("cssbeautify");
const path = require("path");
var isTemplateCssProcessed = false;
const frontEndTheme = `${process.env.FRONT_END_THEME}`

module.exports = cssService = {
  startup: async function () {
    emitterService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options && options.page) {
        await cssService.getCssFile(options.page);
        // await cssService.getCssLinks(options);
      }
    });

    if (!isTemplateCssProcessed) {
      //runs once at statup
      // console.log("regen template css");
      isTemplateCssProcessed = true;

      await cssService.processTemplateCss();
    }

    // emitterService.on("requestBegin", async function (options) {
    //   //handle combined js file
    //   // if (process.env.MODE !== "production") return;

    //   if (
    //     options.req.url === ("/css-processed/template.css")
    //   ) {
    //     console.log('css processed')

    //     let file = path.join(
    //       __dirname,
    //       "..",
    //       "storage/css/template.css"
    //     );

    //     console.log('file', file);

    //     options.res.setHeader("Cache-Control", "public, max-age=2592000");
    //     options.res.setHeader(
    //       "Expires",
    //       new Date(Date.now() + 2592000000).toUTCString()
    //     );
    //     options.res.sendFile(file);
    //     options.req.isRequestAlreadyHandled = true;
    //     return;
    //   }
    // });
  },

  processTemplateCss: async function () {
    let originalFilePath = `/server/themes/front-end/${frontEndTheme}/css/template.css`;
    let originalFile = await fileService.getFile(originalFilePath);
    // console.log(originalFile);
    let processedFilePath = `/server/themes/front-end/${frontEndTheme}/css/template-processed.css`

    let viewModel = await dataService.getContentTopOne("site-settings-colors");

    // console.log("processing template css data", viewModel);
    let cssPath = path.join(originalFilePath);
    let processCssString = await viewService.getProcessedView(
      "site-settings-colors",
      viewModel.data,
      cssPath
    );

    // console.log(processCssString);
    fileService.writeFile(processedFilePath, processCssString);
  },

  // processSections: async function (cssString) {

  //     let sections = await dataService.getContentByContentType('section')
  //     sections.forEach(section => {
  //         if (section.data.background) {
  //             if (section.data.background.type === 'color') {
  //                 let color = section.data.background.color;
  //                 cssString += ` section[data-id="${section.id}"]{background-color:${color}}`
  //             }
  //         }
  //     });

  //     return cssString;
  // },

  getCssFile: async function (page) {
    //get template.css
    let cssString = await fileService.getFile(`/server/themes/front-end/${frontEndTheme}/css/template.css`);
    //parse the css
    var ast = csstree.parse(cssString);
    let cleanCss = csstree.generate(ast);
    let beatifulCss = cssbeautify(cleanCss);

    page.data.editor = { css: beatifulCss };
  },
};
