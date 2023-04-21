var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
const _ = require("lodash");
const dalService = require("../../../services/dal.service");

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
      if (req.url?.indexOf("/blog/") === 0) {
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

    emitterService.on("addUrl", async function (options) {
      const taxonomies = await dalService.contentGet(
        null,
        "taxonomy",
        null,
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
        const content = await dataService.getContentByUrl(options.urlKey.url);
        const taxonomy = await dataService.taxonomyGet(
          undefined,
          content.contentTypeId,
          options.urlKey.url
        );
        const detailsPage = await dalService.contentGet(taxonomy[0].data.detailsPage);

        options.req.content = content;
        options.req.taxonomy = taxonomy;
        options.req.detailsPage = detailsPage;

        let taxonomyDetailsUrl = detailsPage?.url ?? "/taxonomy-details";
        options.req.url = taxonomyDetailsUrl;
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
        if (req.url === "/taxonomy-get" || req.url === '/taxonomy-get?limit=100&skip=0') {
          taxonomies = await dataService.getContentByType("taxonomy");
          res.send({ data: taxonomies });
          return;
        }

        let id = req.url.substring(req.url.lastIndexOf("/") + 1);

        if (id) {
          let taxonomy = await dataService.getContentById(id);
          res.send(taxonomy?.data);
        }
      });

      app.get("/api-admin/page-templates", async function (req, res) {
        let data = await dataService.getContentByType("page");
        let pageTemplates = data.map((r) => {
          return { id: r.id, name: r.data.title };
        });
        pageTemplates = _.sortBy(pageTemplates, "name");
        res.send(pageTemplates);
      });

      app.get("/api-admin/content-types", async function (req, res) {
        let data = await dataService.contentTypesGet();
        let pageTemplates = data.map((r) => {
          return { id: r.systemId, name: r.title };
        });
        pageTemplates = _.sortBy(pageTemplates, "name");
        res.send(pageTemplates);
      });
    }
  },
};
