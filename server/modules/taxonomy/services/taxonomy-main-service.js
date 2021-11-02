var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
const _ = require("lodash");

module.exports = taxonomyMainService = {
  startup: async function (app) {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "TAXONOMY") {
        options.moduleName = "taxonomy";
        await moduleService.processModuleInColumn(options);
      }

      emitterService.on("postModuleGetData", async function (options) {
        if (options.shortcode.name === "TAXONOMY") {
          let list = await dataService.getContentById(
            options.viewModel.data.taxonomy
          );

          options.viewModel.data.list = list.data.terms;
        }
      });

      emitterService.on("preProcessPageUrlLookup", async function (req) {
        if (req.url.indexOf("/blog/") === 0) {
          let list = await dataService.getContentByType("taxonomy");

          //check if its a taxonomy page
          //https://stackoverflow.com/questions/24756779/underscore-js-find-and-return-element-in-nested-array/24757040
          var taxonomy = _(list)
            .chain();


            // .pluck("data.terms")
            // .flatten()
            // .findWhere({ urlRelative: req.url })
            // .value();

          req.url = "/blog";
        }
      });
    });

    app.get("/taxonomy-get*", async function (req, res) {
      if (req.url === "/taxonomy-get") {
        taxonomies = await dataService.getContentByType("taxonomy");
        res.send({ data: taxonomies });
        return;
      }

      let id = req.url.substring(req.url.lastIndexOf("/") + 1);

      if (id) {
        let taxonomy = await dataService.getContentById(id);
        res.send(taxonomy.data);
      }
    });
  },
};
