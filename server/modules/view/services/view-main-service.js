var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var fileService = require("../../../services/file.service");
var helperService = require("../../../services/helper.service");
var formattingService = require("../../../services/formatting.service");

var appRoot = require("app-root-path");
var path = require("path");

module.exports = viewMainService = {
  startup: async function (app) {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "VIEW") {
        options.moduleName = "view";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "VIEW") {
        await viewMainService.getViewData(options);
        const dynamicView = options.viewModel.data.view;
        options.viewPath = dynamicView
          ? `server/modules/view/views/${dynamicView}`
          : "server/modules/view/views/text-card.hbs";
          await emitterService.emit("viewPostModuleGetData", options);
      }
    });

    if (app) {
      app.get("/api-admin/views-get*", async function (req, res) {
        const folderPath = path.join(
          appRoot.path + "/server/modules/view/views"
        );
        let viewFiles = fileService.getFilesSearchSync(folderPath, "/**/*.hbs");
        viewFiles = viewFiles.map((f) => {
          let fileName = f.substring(f.lastIndexOf("/") + 1);
          return { id: fileName };
        });
        res.send(viewFiles);
      });
    }
  },

  getViewData: async function (options) {
    let id = options.shortcode.properties.id;
    let groupId = options.req.content ? options.req.content.id : null;

    if (options.viewModel.data.contentTypeToLoad === "group") {
      options.viewModel.group = options.req.content;
    } else {
      options.viewModel.list = await dataService.getContentByTypeAndGroup(
        options.viewModel.data.contentTypeToLoad,
        groupId,
        options.req.sessionID
      );

      viewMainService.trimBody(options);
    }

    // console.log(options.viewModel.data.contentTypeToLoad, moduleData);
  },

  trimBody: async function (options) {
    options.viewModel.list.map((item) => {
      if (item.data.body) {
        item.data.body = formattingService.truncateStringAndClearNewLines(
          item.data.body,
          options.viewModel.data.maxBodyCharacters
        );
      }
    });
  },
};
