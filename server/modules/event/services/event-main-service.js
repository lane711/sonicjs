var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var moment = require("moment");
var _ = require("underscore");

module.exports = eventMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'EVENT') {

                options.moduleName = 'event';
                await moduleService.processModuleInColumn(options);
            }

            emitterService.on("postModuleGetData", async function (options) {
                if (options.shortcode.name === "EVENT") {
                  await eventMainService.getViewData(options);
                }
              });

        });
    },

    getViewData: async function (options) {


        let id = options.shortcode.properties.id;
        let groupId = options.req.content ? options.req.content.id : null;
    
        let announcements = await dataService.getContentByTypeAndGroup(
            'event',
            groupId,
            options.req.sessionID
          );
    
    
    
        // let announcements = await dataService.getContentByContentType(
        //   "announcement"
        // );
    
        const now = new Date().getTime();
    
        announcements = _.sortBy(announcements, function (p) {
          return p.data.dateTime;
        });
    
        announcements.map((a) => {
          a.data.dateFormatted = moment(a.data.dateTime).format("MMMM Do YYYY, h:mm a");
        });
    
        options.viewModel.items = announcements;
    
        //emit so we can talley votes
        await emitterService.emit("postModuleGetData2", options);
    
      },

}

