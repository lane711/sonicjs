var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = disqusMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'DISQUS') {

                options.moduleName = 'disqus';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

