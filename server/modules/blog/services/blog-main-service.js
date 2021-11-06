var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var moduleService = require("../../../services/module.service");
var helperService = require("../../../services/helper.service");
var formattingService = require("../../../services/formatting.service");
var frontEndTheme = `${process.env.FRONT_END_THEME}`;

module.exports = blogMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "BLOG") {
        options.moduleName = "blog";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "BLOG") {
        await blogMainService.getBlogData(options);
      }
    });

    // emitterService.on("processUrl", async function (options) {
    //   if (options.urlKey.handler === "blogHandler") {
    //     // const data = await blogMainService.getBlogData(options);
    //     const data = await dataService.getContentByUrl(options.urlKey.url);

    //     options.res.render(`front-end/${frontEndTheme}/layouts/main`, {
    //       layout: `front-end/${frontEndTheme}/${frontEndTheme}`,
    //       data: options.page.data,
    //     });

    //     return;
    //   }
    // });

    // emitterService.on("processUrl", async function (options) {
    //   if (options.urlKey.handler === "blogHandler") {
    //     var { page : pageData } = await contentService.getRenderedPage(options.req);
    //     const data = await dataService.getContentByUrl(options.urlKey.url);

    //     options.page = pageData;

    //     return;
    //   }
    // });

    emitterService.on("modulesLoaded", async function (options) {
      const blogs = await dalService.contentGet(
        null,
        "blog",
        null,
        null,
        null,
        null,
        null,
        null,
        true
      );
      blogs.map((blog) => {
        urlService.addUrl(blog.url, "blogHandler", "exact");
      });
    });

  },

  getBlogData: async function (options) {
    let id = options.shortcode.properties.id;
    let moduleData = await dataService.getContentById(
      id,
      options.req.sessionID
    );
    let contentType = "blog";
    let viewModel = moduleData;

    let listRaw = await dataService.getContentByType(
      contentType,
      options.req.sessionID
    );
    listRaw = listRaw.sort((a, b) => (a.createdOn > b.createdOn ? 1 : -1));

    listRaw = listRaw.filter((x) => x.data.title);
    let list = listRaw.map(function (record) {
      return {
        data: {
          title: record.data.title,
          body: formattingService.stripHtmlTags(
            helperService.truncateString(record.data.body, 400)
          ),
          image: record.data.fileName
            ? mediaService.getMediaUrl(record.data.fileName.file)
            : undefined,
          url: record.data.url,
          createdOn: record.createdOn,
        },
      };
    });

    let sortedList = list.sort((a, b) =>
      a.data.createdOn < b.data.createdOn ? 1 : -1
    );
    options.viewModel.data.list = sortedList;

    // Wait for all Promises to complete
    // Promise.all(list)
    //   .then((list) => {
    //     // Handle results
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //   });
  },

  // processView: async function (contentType, viewModel, viewPath) {
  //   var result = await viewService.getProcessedView(
  //     contentType,
  //     viewModel,
  //     viewPath
  //   );

  //   return result;
  // },
};
