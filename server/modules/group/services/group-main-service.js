var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = groupMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'GROUP') {

                options.moduleName = 'group';
                await moduleService.processModuleInColumn(options);
            }

        });

        //add group select list
        emitterService.on('formComponentsLoaded', async function (contentType) {
console.log('adding group id')
            //TODO: limit to specified content types
            contentType.data.components.splice(-1, 0, {
                type: "textfield",
                inputType: "text",
                key: "groupId",
                label:"Group",
                hidden: false,
                input: true,
              });

        });
    },

}

