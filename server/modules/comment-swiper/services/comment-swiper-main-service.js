var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = commentSwiperMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "COMMENT-SWIPER") {
        options.moduleName = "comment-swiper";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "COMMENT-SWIPER") {
        await commentSwiperMainService.getCommentData(options);
      }
    });
  },

  getCommentData: async function (options) {
    let id = options.shortcode.properties.id;
    let moduleData = await dataService.getContentById(id);
    let contentType = "comment";
    let viewModel = moduleData;

    let listRaw = await dataService.getContentByType(contentType);

    options.viewModel.data.list = listRaw;

    // listRaw = listRaw.filter((x) => x.data.title);
    // let list = listRaw.map(function (record) {
    //   return {
    //     data: {
    //       title: record.data.title,
    //       body: formatService.stripHtmlTags(
    //         helperService.truncateString(record.data.body, 400)
    //       ),
    //       image: record.data.fileName
    //         ? dataService.getImageUrl(record.data.fileName)
    //         : undefined,
    //       url: record.data.url,
    //       createdOn: record.data.createdOn,
    //     },
    //   };
    // });

    // await formattingService.formatDates(list, true);

    // viewModel.list = list;
    // let viewPath = `/server/modules/blog/views/blog-main.hbs`;
    // // let sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
    // // await mediaService.addMediaUrl(sortedFiles);
    // // viewModel.data.files = sortedFiles;
    // let processedHtml = await blogMainService.processView(
    //   contentType,
    //   viewModel,
    //   viewPath
    // );

    // options.viewModel.data.list = list;
  },
};
