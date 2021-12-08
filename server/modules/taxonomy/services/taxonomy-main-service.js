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
    });

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
        var taxonomy = _(list).chain();

        // .pluck("data.terms")
        // .flatten()
        // .findWhere({ urlRelative: req.url })
        // .value();

        req.url = "/blog";
      }
    });

    emitterService.on("modulesLoaded", async function (options) {
      const taxonomies = await dalService.contentGet(
        null,
        "taxonomy",
        null,
        null,
        null,
        null,
        null,
        null,
        true
      );
      taxonomies.map((taxonomy) => {
        const data = JSON.parse(taxonomy.data);
        data.terms.map((term) => {
          urlService.addUrl(
            term.urlRelative,
            "taxonomyHandler",
            "exact",
            term.title,
            term.id
          );
        });
      });
    });

    emitterService.on("processUrl", async function (options) {
      if (options.urlKey?.handler === "taxonomyHandler") {
        const taxonomy = await dataService.getContentByUrl(options.urlKey.url);

        let blogDetailsUrl = "/taxonomy-details";
        options.req.url = blogDetailsUrl;
        var { page: pageData } = await contentService.getRenderedPage(
          options.req
        );
        options.page = pageData;

        //overrides
        options.page.data.heroTitle = options.urlKey.title;
        options.page.data.title = options.urlKey.title;
        options.page.data.metaTitle = options.urlKey.title;

        return;
      }
    });

    if (app) {
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
    }
  },
};
