var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = galleryMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'GALLERY') {

                options.moduleName = 'gallery';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

