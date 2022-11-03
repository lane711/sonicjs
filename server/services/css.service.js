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
const frontEndTheme = `${process.env.FRONT_END_THEME}`;
const { getConnection } = require("typeorm");
const { Content } = require("../data/model/Content");
var appRoot = require("app-root-path");

module.exports = cssService = {
  startup: async function (app) {

    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options && options.page) {
        await cssService.getCssFile(options.page);
        // await cssService.getCssLinks(options);
      }
    });

    app.get("/css/site.css", async function (req, res) {

      let originalFilePath = `${frontEndTheme}/css/template.css`;
      let processedFilePath = `${frontEndTheme}/css/template-processed.css`;
  
      let css = await fileService.getFile(originalFilePath);
      let sectionStyles = await cssService.getSectionStyles();
      let processedCss = css + `\n${sectionStyles}`;
  
      // console.log(processCssString);
      await fileService.writeFile(processedFilePath, processedCss);

      res.set("Content-Type", "text/css");
      res.send(processedCss);
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

    app.post("/admin/update-css", async function (req, res) {
      let cssContent = req.body.css;

      let cssFilePath = `${appRoot.path}/${frontEndTheme}/css/template.css`;

      let result = await dataService.fileUpdate(
        cssFilePath,
        cssContent,
        req.sessionID
      );

      if (result.filePath === cssFilePath) {
        res.send(200, "ok");
      } else {
        res.send(500);
      }
    });
  },

  getSectionStyles: async function () {

    let cssString = '';
    let sections = await dataService.getContentByContentType('section')
    for (const section of sections){
      let sectionMiniGuid = section.id.substr(section.id.length - 12);

        let sectionCss = await cssService.getSectionStyle(section);
        console.log('css section id', sectionMiniGuid, sectionCss);

        cssString += `\n.css-${sectionMiniGuid}{${sectionCss?.style}}\n`

        // if (section.data.background) {
        //   let sectionMiniGuid = section.id.substr(section.id.length - 12);
        //     if (section.data.background.type === 'color') {
        //         let color = section.data.background.color;
        //         cssString += ` section[data-id="${section.id}"]{background-color:${color}}`
        //     }
        // }
    };

    return cssString;
},

  getSectionStyle: async function (section) {
    if (section.data.background) {
      let styleList = [];
      let cssList = [];
      let backgroundList = [];

      if (section.data.overlay) {
        backgroundList.push(
          `linear-gradient(${section.data.overlayTopColor}, ${section.data.overlayBottomColor})`
        );
      }

      switch (section.data.background) {
        case "color":
          let colorRGBA = section.data.color;
          if (colorRGBA) {
            backgroundList.push(`${colorRGBA};`);
          }
          break;
        case "image":
          let imageSrc = section.data.image.src;
          if (imageSrc) {
            backgroundList.push(`url(${imageSrc});`);
            cssList.push("bg-image-cover");
          }
        case "svg":
          let svgRaw = section.data.svgRaw;
          if (svgRaw) {
            backgroundList.push(`url(${svgRaw});`);
            cssList.push("bg-image-cover");
          }
          break;
        default:
          break;
      }


//       background-color: #ffffff;
// background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(240)'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%234FE'/%3E%3C/linearGradient%3E%3Cpattern patternUnits='userSpaceOnUse' id='b' width='540' height='450' x='0' y='0' viewBox='0 0 1080 900'%3E%3Cg fill-opacity='0.1'%3E%3Cpolygon fill='%23444' points='90 150 0 300 180 300'/%3E%3Cpolygon points='90 150 180 0 0 0'/%3E%3Cpolygon fill='%23AAA' points='270 150 360 0 180 0'/%3E%3Cpolygon fill='%23DDD' points='450 150 360 300 540 300'/%3E%3Cpolygon fill='%23999' points='450 150 540 0 360 0'/%3E%3Cpolygon points='630 150 540 300 720 300'/%3E%3Cpolygon fill='%23DDD' points='630 150 720 0 540 0'/%3E%3Cpolygon fill='%23444' points='810 150 720 300 900 300'/%3E%3Cpolygon fill='%23FFF' points='810 150 900 0 720 0'/%3E%3Cpolygon fill='%23DDD' points='990 150 900 300 1080 300'/%3E%3Cpolygon fill='%23444' points='990 150 1080 0 900 0'/%3E%3Cpolygon fill='%23DDD' points='90 450 0 600 180 600'/%3E%3Cpolygon points='90 450 180 300 0 300'/%3E%3Cpolygon fill='%23666' points='270 450 180 600 360 600'/%3E%3Cpolygon fill='%23AAA' points='270 450 360 300 180 300'/%3E%3Cpolygon fill='%23DDD' points='450 450 360 600 540 600'/%3E%3Cpolygon fill='%23999' points='450 450 540 300 360 300'/%3E%3Cpolygon fill='%23999' points='630 450 540 600 720 600'/%3E%3Cpolygon fill='%23FFF' points='630 450 720 300 540 300'/%3E%3Cpolygon points='810 450 720 600 900 600'/%3E%3Cpolygon fill='%23DDD' points='810 450 900 300 720 300'/%3E%3Cpolygon fill='%23AAA' points='990 450 900 600 1080 600'/%3E%3Cpolygon fill='%23444' points='990 450 1080 300 900 300'/%3E%3Cpolygon fill='%23222' points='90 750 0 900 180 900'/%3E%3Cpolygon points='270 750 180 900 360 900'/%3E%3Cpolygon fill='%23DDD' points='270 750 360 600 180 600'/%3E%3Cpolygon points='450 750 540 600 360 600'/%3E%3Cpolygon points='630 750 540 900 720 900'/%3E%3Cpolygon fill='%23444' points='630 750 720 600 540 600'/%3E%3Cpolygon fill='%23AAA' points='810 750 720 900 900 900'/%3E%3Cpolygon fill='%23666' points='810 750 900 600 720 600'/%3E%3Cpolygon fill='%23999' points='990 750 900 900 1080 900'/%3E%3Cpolygon fill='%23999' points='180 0 90 150 270 150'/%3E%3Cpolygon fill='%23444' points='360 0 270 150 450 150'/%3E%3Cpolygon fill='%23FFF' points='540 0 450 150 630 150'/%3E%3Cpolygon points='900 0 810 150 990 150'/%3E%3Cpolygon fill='%23222' points='0 300 -90 450 90 450'/%3E%3Cpolygon fill='%23FFF' points='0 300 90 150 -90 150'/%3E%3Cpolygon fill='%23FFF' points='180 300 90 450 270 450'/%3E%3Cpolygon fill='%23666' points='180 300 270 150 90 150'/%3E%3Cpolygon fill='%23222' points='360 300 270 450 450 450'/%3E%3Cpolygon fill='%23FFF' points='360 300 450 150 270 150'/%3E%3Cpolygon fill='%23444' points='540 300 450 450 630 450'/%3E%3Cpolygon fill='%23222' points='540 300 630 150 450 150'/%3E%3Cpolygon fill='%23AAA' points='720 300 630 450 810 450'/%3E%3Cpolygon fill='%23666' points='720 300 810 150 630 150'/%3E%3Cpolygon fill='%23FFF' points='900 300 810 450 990 450'/%3E%3Cpolygon fill='%23999' points='900 300 990 150 810 150'/%3E%3Cpolygon points='0 600 -90 750 90 750'/%3E%3Cpolygon fill='%23666' points='0 600 90 450 -90 450'/%3E%3Cpolygon fill='%23AAA' points='180 600 90 750 270 750'/%3E%3Cpolygon fill='%23444' points='180 600 270 450 90 450'/%3E%3Cpolygon fill='%23444' points='360 600 270 750 450 750'/%3E%3Cpolygon fill='%23999' points='360 600 450 450 270 450'/%3E%3Cpolygon fill='%23666' points='540 600 630 450 450 450'/%3E%3Cpolygon fill='%23222' points='720 600 630 750 810 750'/%3E%3Cpolygon fill='%23FFF' points='900 600 810 750 990 750'/%3E%3Cpolygon fill='%23222' points='900 600 990 450 810 450'/%3E%3Cpolygon fill='%23DDD' points='0 900 90 750 -90 750'/%3E%3Cpolygon fill='%23444' points='180 900 270 750 90 750'/%3E%3Cpolygon fill='%23FFF' points='360 900 450 750 270 750'/%3E%3Cpolygon fill='%23AAA' points='540 900 630 750 450 750'/%3E%3Cpolygon fill='%23FFF' points='720 900 810 750 630 750'/%3E%3Cpolygon fill='%23222' points='900 900 990 750 810 750'/%3E%3Cpolygon fill='%23222' points='1080 300 990 450 1170 450'/%3E%3Cpolygon fill='%23FFF' points='1080 300 1170 150 990 150'/%3E%3Cpolygon points='1080 600 990 750 1170 750'/%3E%3Cpolygon fill='%23666' points='1080 600 1170 450 990 450'/%3E%3Cpolygon fill='%23DDD' points='1080 900 1170 750 990 750'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect x='0' y='0' fill='url(%23b)' width='100%25' height='100%25'/%3E%3C/svg%3E");
// background-attachment: fixed;
// background-size: cover;

      if (section.data.textColor) {
        cssList.push(section.data.textColor);
      }

      if (section.data.css) {
        cssList.push(section.data.css);
      }

      let background = "background: " + backgroundList.join(", ");
      let style = styleList.join(", ") + `${background}`;
      let css = cssList.join(" ");

      // background: linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.72)), url(/assets/uploads/cheetah.jpeg);

      // console.log("style", style);
      // console.log("css", css);
      // console.log("background", background);

      return { style , css };
    }
  },

  processTemplateCss: async function () {
    let originalFilePath = `${frontEndTheme}/css/template.css`;
    let processedFilePath = `${frontEndTheme}/css/template-processed.css`;

    let css = await fileService.getFile(originalFilePath);
    let processedCss = css + '\ntest{}';

    // console.log(processCssString);
    await fileService.writeFile(processedFilePath, processedCss);
  },



  getCssFile: async function (page) {
    //get template.css
    let cssString = await fileService.getFile(
      `${frontEndTheme}/css/template.css`
    );
    //parse the css
    var ast = csstree.parse(cssString);
    let cleanCss = csstree.generate(ast);
    let beatifulCss = cssbeautify(cleanCss);

    page.data.editor = { css: beatifulCss };
  },
};
