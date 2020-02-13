var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");
var jimp = require("jimp");
var path = require("path");
const fs = require('fs')

module.exports = imageProcessingMainService = {
  startup: async function() {
    eventBusService.on("beginProcessModuleShortCode", async function(options) {
      if (options.shortcode.name === "IMAGE-PROCESSING") {
        options.moduleName = "image-processing";
        await moduleService.processModuleInColumn(options);
      }
    });

    eventBusService.on("requestBegin", async function(options) {
      if (options.req.url.startsWith("/images/")) {

        globalService.isRequestAlreadyHandled = true;

        // Read the image.
        let filePath = decodeURIComponent(options.req.path);
        let fileName = filePath.replace('/images/','');
        let width = options.req.query.width;
        let imagePath = path.join(__dirname, "../../..", `/storage/files/${fileName}`);
        let newImagePath = `server/storage/files/width-${width}/${fileName}`;

        try {
          if (!fs.existsSync(newImagePath)) {
            //file does not exist
            const image = await jimp.read(imagePath);
            await image.resize(parseInt(width), jimp.AUTO);
            let img = await image.writeAsync(newImagePath);
          }
        } catch(err) {
          console.error(err)
        }

        options.res.sendFile(newImagePath, {root: './'})
      }
    });
  }
};
