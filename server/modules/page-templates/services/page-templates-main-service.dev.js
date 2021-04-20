"use strict";

var dataService = require("../../../services/data.service");

var emitterService = require("../../../services/emitter.service");

var globalService = require("../../../services/global.service");

var contentService = require("../../../services/content.service");

var formattingService = require("../../../services/formatting.service");

module.exports = pageTemplatesMainService = {
  startup: function startup() {
    return regeneratorRuntime.async(function startup$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            emitterService.on("beginProcessModuleShortCode", function _callee(options) {
              var ptDiv;
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (!(options.shortcode.name === "PAGE-TEMPLATES")) {
                        _context.next = 6;
                        break;
                      }

                      options.moduleName = "page-templates"; //reset html for current page template region

                      ptDiv = formattingService.generateModuleDivWrapper(options.shortcode.properties.id, "module", "", options.shortcode.name, options.shortcode.name, "PAGE TEMPLATE REGION");
                      options.page.data.currentShortCodeHtml = "<div class=\"module page-template-region mb-2\" data-id=\"".concat(options.shortcode.properties.id, "\" data-module=\"PAGE-TEMPLATES\">PAGE TEMPLATE REGION START</div>");
                      _context.next = 6;
                      return regeneratorRuntime.awrap(moduleService.processModuleInColumn(options));

                    case 6:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            });
            emitterService.on("postModuleGetData", function _callee2(options) {
              var regionId, body;
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      if (!(options.shortcode.name === "PAGE-TEMPLATES")) {
                        _context2.next = 9;
                        break;
                      }

                      if (!options.page.data.pageTemplateRegions) {
                        _context2.next = 7;
                        break;
                      }

                      regionId = options.viewModel.data.id;
                      body = options.page.data.pageTemplateRegions.filter(function (r) {
                        return r.regionId === regionId;
                      }); // options.page.data.html = body[0].shortCodes;

                      if (!(body && body.length > 0)) {
                        _context2.next = 7;
                        break;
                      }

                      _context2.next = 7;
                      return regeneratorRuntime.awrap(contentService.processShortCodes(options.page, "s0", body[0].shortCodes, 0, 0));

                    case 7:
                      options.page.data.currentShortCodeHtml += "<div class=\"page-template-region mt-2\" data-id=\"".concat(options.shortcode.properties.id, "\" data-module=\"PAGE-TEMPLATES\">PAGE TEMPLATE REGION END</div>");
                      options.viewModel.data.html = options.page.data.currentShortCodeHtml; // options.viewModel.data.html = processedHtml.body;
                      // if (options.page.data.isPageTemplate) {
                      //   //we are viewing the template page itself
                      //   options.viewModel.data.html = "<div>PAGE TEMPLATE REGION</div>";
                      // }

                    case 9:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            });
            emitterService.on("preRenderTemplate", function _callee3(options) {
              return regeneratorRuntime.async(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                    case "end":
                      return _context3.stop();
                  }
                }
              });
            });
            emitterService.on("preProcessSections", function _callee4(page) {
              var templatePage;
              return regeneratorRuntime.async(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      if (!(page.data.pageTemplate && page.data.pageTemplate !== "none")) {
                        _context4.next = 5;
                        break;
                      }

                      _context4.next = 3;
                      return regeneratorRuntime.awrap(dataService.getContentById(page.data.pageTemplate));

                    case 3:
                      templatePage = _context4.sent;

                      if (templatePage) {
                        page.data.layout = templatePage.data.layout;
                      }

                    case 5:
                    case "end":
                      return _context4.stop();
                  }
                }
              });
            });

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    });
  }
};