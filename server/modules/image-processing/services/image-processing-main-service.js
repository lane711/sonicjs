var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var jimp = require(jimp);

module.exports = imageProcessingMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'IMAGE-PROCESSING') {

                options.moduleName = 'image-processing';
                await moduleService.processModuleInColumn(options);
            }

        });

        eventBusService.on('requestBegin', async function (options) {

          if(options.req.url.startsWith("/images/")){
            console.log('processing image...');
            globalService.isRequestAlreadyHandled = true;

            // Read the image.
	const image = await jimp.read('../../storage/files/newyork.jpeg');

	// Resize the image to width 150 and auto height.
	await image.resize(150, jimp.AUTO);

	// Save and overwrite the image
  await image.writeAsync('test/image.png');

            options.res.send(200);
          }
      });

    },

}
