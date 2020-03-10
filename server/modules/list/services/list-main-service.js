var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");
var helperService = require("../../../services/helper.service");
var formatService = require("../../../services/formatting.service");

module.exports = listMainService = {
  startup: async function() {
    eventBusService.on("beginProcessModuleShortCode", async function(options) {
      if (options.shortcode.name === "LIST") {
        let id = options.shortcode.properties.id;
        let moduleData = await dataService.getContentById(id);
        let contentType = moduleData.data.contentType;
        let viewModel = moduleData;

        let listRaw = await dataService.getContentByType(contentType);

        listRaw = listRaw.filter(x => x.data.title);
        let list = listRaw.map(function(record) {
          return {
            data: {
              title: record.data.title,
              body: formatService.stripHtmlTags(
                helperService.truncateString(record.data.body, 400)
              ),
              image: record.data.image
                ? dataService.getImageUrl(record.data.image[0])
                : undefined,
              url: record.data.url,
              createdOn: record.data.createdOn
            }
          };
        });

        await formattingService.formatDates(list, true);

        viewModel.list = list;
        let viewPath = __dirname + `/../views/list-main.handlebars`;

        // let sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
        // await mediaService.addMediaUrl(sortedFiles);
        // viewModel.data.files = sortedFiles;
        let proccessedHtml = await mediaMainService.processView(
          contentType,
          viewModel,
          viewPath
        );

        globalService.pageContent = globalService.pageContent.replace(
          options.shortcode.codeText,
          proccessedHtml
        );
      }
    });
  },

  processView: async function(contentType, viewModel, viewPath) {
    var result = await viewService.getProccessedView(
      contentType,
      viewModel,
      viewPath
    );

    return result;
  }
};
