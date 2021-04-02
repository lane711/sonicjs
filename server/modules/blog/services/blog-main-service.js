var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var helperService = require("../../../services/helper.service");
var formatService = require("../../../services/formatting.service");

module.exports = blogMainService = {
  startup: async function() {
    emitterService.on("beginProcessModuleShortCode", async function(options) {


      if (options.shortcode.name === "BLOG-SETTINGS") {
        options.moduleName = 'blog';
        options.shortcode.name = 'BLOG'

        let id = options.shortcode.properties.id;
        let moduleData = await dataService.getContentById(id);
        let contentType = 'blog';
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
              image: record.data.fileName
                ? dataService.getImageUrl(record.data.fileName)
                : undefined,
              url: record.data.url,
              createdOn: record.data.createdOn
            }
          };
        });

        // await formattingService.formatDates(list, true);

        viewModel.list = list;
        let viewPath = `/server/modules/blog/views/blog-main.hbs`;
        // let sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
        // await mediaService.addMediaUrl(sortedFiles);
        // viewModel.data.files = sortedFiles;
        let processedHtml = await mediaMainService.processView(
          contentType,
          viewModel,
          viewPath
        );

        options.page.data.html = options.page.data.html.replace(
          options.shortcode.codeText,
          processedHtml
        );
      }
    });
  },

  processView: async function(contentType, viewModel, viewPath) {
    var result = await viewService.getProcessedView(
      contentType,
      viewModel,
      viewPath
    );

    return result;
  }
};
