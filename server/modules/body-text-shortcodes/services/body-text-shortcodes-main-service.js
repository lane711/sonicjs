var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var moduleService = require("../../../services/module.service");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;

module.exports = bodyTextShortcodesMainService = {
  startup: async function () {
    emitterService.on("postModuleGetData", async function (options) {

        if(options.viewModel && options.viewModel.data && options.viewModel.data.body){

            let parsedBlock = ShortcodeTree.parse(options.viewModel.data.body);
        
            if (parsedBlock.children) {
              for (let bodyBlock of parsedBlock.children) {
                if(bodyBlock.shortcode){

                        let id = bodyBlock.shortcode.properties.id;
                        if(!id) continue;
                        let contentType = bodyBlock.shortcode.name.toLowerCase();
                        let viewPath = await moduleService.getModuleViewFile(contentType);
                        let viewModel = await dataService.getContentById(id, options.req.sessionID);
                  
                        var processedHtml = {
                          id: id,
                          contentType: contentType,
                          shortCode: options.shortcode,
                          body: await moduleService.processView(contentType, viewModel, viewPath),
                        };
                  
                  
                        options.viewModel.data.body = options.viewModel.data.body.replace(
                            bodyBlock.shortcode.codeText,
                          processedHtml.body
                        );
                }
              }
            }
        }

    });
  },
};
