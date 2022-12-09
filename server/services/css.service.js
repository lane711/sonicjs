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

    //merged css for sections into the main template file
    app.get("/css/template-processed.css", async function (req, res) {
      let originalFilePath = `${frontEndTheme}/css/template.css`;
      let processedFilePath = `/${frontEndTheme}/css/template-processed.css`;

      let css = await fileService.getFile(originalFilePath);
      let sectionStyles = await cssService.getSectionStyles();
      let processedCss = css + `\n${sectionStyles}`;

      // console.log(processCssString);
      await fileService.writeFile(processedFilePath, processedCss);

      res.set("Content-Type", "text/css");
      res.send(processedCss);
    });

    // if (!isTemplateCssProcessed) {
    //   //runs once at statup
    //   // console.log("regen template css");
    //   isTemplateCssProcessed = true;

    //   await cssService.processTemplateCss();
    // }

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
        res.status(200).send('ok');
      } else {
        res.status(500);
      }
    });
  },

  getSectionStyles: async function () {
    let cssString = "";
    let sections = await dataService.getContentByContentType("section");
    for (const section of sections) {
      let sectionMiniGuid = section.id.substr(section.id.length - 12);

      let sectionCss = await cssService.getSectionStyle(section);
      // console.log('css section id', sectionMiniGuid, sectionCss);

      if (sectionCss?.style) {
        cssString += `\n.css-${sectionMiniGuid}{${sectionCss?.style}}\n`;
      }

      if (sectionCss?.overlay) {
        cssString += `\n.overlay-${sectionMiniGuid}{${sectionCss?.overlay}}\n`;
      }

      // if (section.data.background) {
      //   let sectionMiniGuid = section.id.substr(section.id.length - 12);
      //     if (section.data.background.type === 'color') {
      //         let color = section.data.background.color;
      //         cssString += ` section[data-id="${section.id}"]{background-color:${color}}`
      //     }
      // }
    }

    return cssString;
  },

  getSectionStyle: async function (section) {
    if (section.data.background) {
      let styleList = [];
      let cssList = [];
      let backgroundList = [];
      let paddingList = [];
      let marginList = [];
      let overlay = "";

      if (section.data.overlay) {
        overlay = `background: linear-gradient(${section.data.overlayTopColor}, ${section.data.overlayBottomColor})`;
      }

      if (section.data.paddingTop) {
        paddingList.push(section.data.paddingTop);
      }
      if (section.data.paddingLeft) {
        paddingList.push(section.data.paddingLeft);
      }
      if (section.data.paddingBottom) {
        paddingList.push(section.data.paddingBottom);
      }
      if (section.data.paddingRight) {
        paddingList.push(section.data.paddingRight);
      }

      if (section.data.marginTop) {
        marginList.push(section.data.marginTop);
      }
      if (section.data.marginLeft) {
        marginList.push(section.data.marginLeft);
      }
      if (section.data.marginBottom) {
        marginList.push(section.data.marginBottom);
      }
      if (section.data.marginRight) {
        marginList.push(section.data.marginRight);
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
          break;
        case "svg":
          let svgRaw = section.data.svgCSS;
          if (svgRaw) {
            styleList.push(`${svgRaw}`);
          }
          break;
        default:
          break;
      }

      // background-color: #ee5522;
      // background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%23FB3'/%3E%3Cstop offset='1' stop-color='%23ee5522'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'%3E%3Cstop offset='0' stop-color='%23f7882b'/%3E%3Cstop offset='1' stop-color='%23ee5522'/%3E%3C/linearGradient%3E%3Cpath id='s' fill='url(%23b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/%3E%3Cg id='g'%3E%3Cuse href='%23s' transform='scale(0.12) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.2) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.25) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(0.3) rotate(-20)'/%3E%3Cuse href='%23s' transform='scale(0.4) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(0.5) rotate(20)'/%3E%3Cuse href='%23s' transform='scale(0.6) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.7) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.835) rotate(-40)'/%3E%3Cuse href='%23s' transform='scale(0.9) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(1.05) rotate(25)'/%3E%3Cuse href='%23s' transform='scale(1.2) rotate(8)'/%3E%3Cuse href='%23s' transform='scale(1.333) rotate(-60)'/%3E%3Cuse href='%23s' transform='scale(1.45) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(1.6) rotate(10)'/%3E%3C/g%3E%3C/defs%3E%3Cg transform='rotate(0 0 0)'%3E%3Cg transform='rotate(0 0 0)'%3E%3Ccircle fill='url(%23a)' r='3000'/%3E%3Cg opacity='0.5'%3E%3Ccircle fill='url(%23a)' r='2000'/%3E%3Ccircle fill='url(%23a)' r='1800'/%3E%3Ccircle fill='url(%23a)' r='1700'/%3E%3Ccircle fill='url(%23a)' r='1651'/%3E%3Ccircle fill='url(%23a)' r='1450'/%3E%3Ccircle fill='url(%23a)' r='1250'/%3E%3Ccircle fill='url(%23a)' r='1175'/%3E%3Ccircle fill='url(%23a)' r='900'/%3E%3Ccircle fill='url(%23a)' r='750'/%3E%3Ccircle fill='url(%23a)' r='500'/%3E%3Ccircle fill='url(%23a)' r='380'/%3E%3Ccircle fill='url(%23a)' r='250'/%3E%3C/g%3E%3Cg transform='rotate(0 0 0)'%3E%3Cuse href='%23g' transform='rotate(10)'/%3E%3Cuse href='%23g' transform='rotate(120)'/%3E%3Cuse href='%23g' transform='rotate(240)'/%3E%3C/g%3E%3Ccircle fill-opacity='0.1' fill='url(%23a)' r='3000'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      // background-attachment: fixed;
      // background-size: cover;

      if (section.data.textColor) {
        cssList.push(section.data.textColor);
      }

      if (section.data.css) {
        cssList.push(section.data.css);
      }

      let background = backgroundList.length
        ? "background: " + backgroundList.join(", ")
        : "";
      let style = styleList.join("; ") + `${background}`;
      let css = cssList.join(" ");
      let padding = paddingList.join(" ");
      let margin = marginList.join(" ");
      // background: linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.72)), url(/assets/uploads/cheetah.jpeg);

      // console.log("style", style);
      // console.log("css", css);
      // console.log("background", background);

      return { style, css, overlay, padding, margin };
    }
  },

  processTemplateCss: async function () {
    let originalFilePath = `${frontEndTheme}/css/template.css`;
    let processedFilePath = `${frontEndTheme}/css/template-processed.css`;

    let css = await fileService.getFile(originalFilePath);
    let processedCss = css + "\ntest{}";

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
