var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = codeSnippetMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'CODE-SNIPPET') {

                options.moduleName = 'code-snippet';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
