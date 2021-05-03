var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = commentGalleryMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'COMMENT-GALLERY') {

                options.moduleName = 'comment-gallery';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name === "COMMENT-GALLERY") {
              await commentGalleryMainService.getCommentData(options);
            }
          });
    
    },

    getCommentData: async function (options) {
        let id = options.shortcode.properties.id;
        let moduleData = await dataService.getContentById(id);
        let contentType = "comment";
        let viewModel = moduleData;
    
        let listRaw = await dataService.getContentByType(contentType);
    
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
    
    
        options.viewModel.data.list = listRaw;
      },
    
      processView: async function (contentType, viewModel, viewPath) {
        var result = await viewService.getProcessedView(
          contentType,
          viewModel,
          viewPath
        );
    
        return result;
      },
    

}

