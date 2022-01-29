const dataService = require('./data.service')
const helperService = require('./helper.service')
const fileService = require('./file.service')
const moduleService = require('./module.service')
const globalService = require('./global.service')
const viewService = require('./view.service')

const emitterService = require('./emitter.service')
const css = require('css')
const axios = require('axios')
const csstree = require('css-tree')
const cssbeautify = require('cssbeautify')
const path = require('path')
let isTemplateCssProcessed = false
const frontEndTheme = `${process.env.FRONT_END_THEME}`
const { getConnection } = require('typeorm')
const { Content } = require('../data/model/Content')

module.exports = cssService = {
  startup: async function () {
    emitterService.on('getRenderedPagePostDataFetch', async function (options) {
      if (options && options.page) {
        await cssService.getCssFile(options.page)
        // await cssService.getCssLinks(options);
      }
    })

    if (!isTemplateCssProcessed) {
      // runs once at statup
      // console.log("regen template css");
      isTemplateCssProcessed = true

      await cssService.processTemplateCss()
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
    const originalFilePath = `/server/themes/front-end/${frontEndTheme}/css/template.css`
    const originalFile = await fileService.getFile(originalFilePath)
    // console.log(originalFile);
    const processedFilePath = `/server/themes/front-end/${frontEndTheme}/css/template-processed.css`

    // let conn = await getConnection();
    // let viewModel = conn.getRepository(Content).find({
    //   where: { contentTypeId: 'site-settings-colors' },
    // });

    // let viewModel = await dataService.getContentTopOne("site-settings-colors");

    // TODO: need to fix the above, hard codeing for now
    const viewModel = {
      contentType: 'site-settings-colors',
      url: '/site-settings-colors',
      bodyBackground: '#F8F8F8',
      headerBackground: '#000',
      headerOpacity: '.95',
      background: 'green',
      header: '#555555',
      createdOn: 1602119522916,
      submit: true,
      id: '290'
    }

    // console.log("processing template css data", viewModel);
    if (viewModel) {
      const cssPath = path.join(originalFilePath)
      const processCssString = await viewService.getProcessedView(
        'site-settings-colors',
        viewModel.data,
        cssPath
      )

      // console.log(processCssString);
      fileService.writeFile(processedFilePath, processCssString)
    }
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
    // get template.css
    const cssString = await fileService.getFile(
      `/server/themes/front-end/${frontEndTheme}/css/template.css`
    )
    // parse the css
    const ast = csstree.parse(cssString)
    const cleanCss = csstree.generate(ast)
    const beatifulCss = cssbeautify(cleanCss)

    page.data.editor = { css: beatifulCss }
  }
}
